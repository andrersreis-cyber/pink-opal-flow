import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useClientes } from "@/hooks/useClientes";
import { useServicos } from "@/hooks/useServicos";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useAuth } from "@/hooks/useAuth";
import { useUsuarios } from "@/hooks/useUsuarios";
import { gerarHorarios, criarDataHora, formatTimeUTC } from "@/lib/dateUtils";
import { formatarPreco } from "@/lib/formatUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { verificarDisponibilidadeRemota } from "@/services/agendamentoService";

const agendamentoSchema = z.object({
  cliente_id: z.number({
    required_error: "Selecione um cliente",
    invalid_type_error: "Cliente inválido"
  }).positive("Selecione um cliente"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  funcionario_id: z.string().uuid("Selecione um funcionário").optional(),
  data: z.date({ required_error: "Selecione uma data" }),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Selecione um horário"),
  status: z.enum(["confirmado", "pendente", "cancelado", "remarcado"]),
  observacoes: z.string().optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento?: any;
  dataInicial?: Date;
  clienteIdInicial?: number;
}

export const AgendamentoModal = ({
  open,
  onOpenChange,
  agendamento,
  dataInicial,
  clienteIdInicial,
}: AgendamentoModalProps) => {
  const { clientes } = useClientes();
  const { servicosPorCategoria, servicos } = useServicos();
  const { createAgendamento, updateAgendamento } = useAgendamentos();
  const { profile, isAdmin } = useAuth();
  const { usuarios } = useUsuarios();
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const isEditing = !!agendamento;

  const form = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      cliente_id: clienteIdInicial || undefined,
      servico_id: "",
      funcionario_id: isAdmin ? undefined : profile?.id,
      data: dataInicial || new Date(),
      hora: "",
      status: "pendente",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (agendamento) {
      const dataAgendamento = new Date(agendamento.data);
      form.reset({
        cliente_id: agendamento.cliente_id,
        servico_id: agendamento.servico_id,
        funcionario_id: agendamento.funcionario_id,
        data: dataAgendamento,
        hora: formatTimeUTC(agendamento.data),
        status: agendamento.status,
        observacoes: agendamento.observacoes || "",
      });
      const servico = servicos?.find((s) => s.id === agendamento.servico_id);
      setServicoSelecionado(servico);
    } else {
      form.reset({
        cliente_id: clienteIdInicial || undefined,
        servico_id: "",
        data: dataInicial || new Date(),
        hora: "",
        status: "pendente",
        observacoes: "",
      });
      setServicoSelecionado(null);
    }
  }, [agendamento, dataInicial, clienteIdInicial, servicos]);

  const onSubmit = async (data: AgendamentoFormData) => {
    try {
      if (!servicoSelecionado) {
        toast.error("Selecione um serviço válido");
        return;
      }

      // Validar cliente_id explicitamente
      if (!data.cliente_id || data.cliente_id <= 0) {
        toast.error("Selecione um cliente válido");
        return;
      }

      // Verificar conflito de horário
      const dataStr = format(data.data, "yyyy-MM-dd");
      const dataHoraInicio = new Date(criarDataHora(dataStr, data.hora));
      const dataHoraFim = new Date(dataHoraInicio.getTime() + servicoSelecionado.duracao_minutos * 60000);

      // 1. Validação Local (Defesa em Profundidade)
      // Buscar agendamentos do dia específico para garantir que não houve race condition ou falha na RPC
      // Usamos UTC para garantir consistência com o banco
      const startOfDay = new Date(dataHoraInicio);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dataHoraInicio);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const { data: agendamentosDoDia } = await supabase
        .from("agendamentos")
        .select("*")
        .gte("data", startOfDay.toISOString())
        .lte("data", endOfDay.toISOString());

      const temConflitoLocal = agendamentosDoDia?.some((ag) => {
        // Ignorar o próprio agendamento na edição
        if (agendamento?.id && ag.id === agendamento.id) return false;
        // Ignorar cancelados
        if (ag.status === "cancelado") return false;

        const agInicio = new Date(ag.data!);
        const agFim = new Date(agInicio.getTime() + (ag.duracao_minutos || 0) * 60000);

        // Lógica de Overlap: (StartA < EndB) AND (EndA > StartB)
        return dataHoraInicio < agFim && dataHoraFim > agInicio;
      });

      if (temConflitoLocal) {
        toast.error("Este horário já está ocupado.");
        return;
      }

      // 2. Validação Remota (RPC)
      // Mantemos como dupla verificação para garantir consistência com o n8n
      const { disponivel } = await verificarDisponibilidadeRemota({
        dataInicio: dataHoraInicio,
        dataFim: dataHoraFim,
        ignorarAgendamentoId: agendamento?.id
      });

      if (!disponivel) {
        toast.error("Este horário já está ocupado. Por favor, escolha outro horário.");
        return;
      }

      // Importante: criarDataHora já retorna ISO string, mas vamos garantir
      const dataHoraISO = dataHoraInicio.toISOString();

      const agendamentoData = {
        cliente_id: data.cliente_id,
        servico_id: data.servico_id,
        funcionario_id: data.funcionario_id || profile?.id,
        data: dataHoraISO,
        duracao_minutos: servicoSelecionado.duracao_minutos,
        preco: servicoSelecionado.preco,
        status: data.status,
        observacoes: data.observacoes || undefined,
      };

      if (isEditing) {
        await updateAgendamento.mutateAsync({
          id: agendamento.id,
          data: dataHoraISO,
          status: data.status,
          funcionario_id: data.funcionario_id || profile?.id,
          observacoes: data.observacoes,
        });
      } else {
        await createAgendamento.mutateAsync(agendamentoData);
      }

      onOpenChange(false);
      form.reset();
      setServicoSelecionado(null);
    } catch (error: any) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error(error.message || "Erro ao salvar agendamento");
    }
  };

  const handleServicoChange = (servicoId: string) => {
    const servico = servicos?.find((s) => s.id === servicoId);
    setServicoSelecionado(servico);
    form.setValue("servico_id", servicoId);
  };

  const horarios = gerarHorarios();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do agendamento"
              : "Preencha os dados para criar um novo agendamento"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : ""}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servico_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço *</FormLabel>
                  <Select
                    onValueChange={handleServicoChange}
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servicosPorCategoria &&
                        Object.entries(servicosPorCategoria).map(([categoria, servs]) => (
                          <div key={categoria}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              {categoria}
                            </div>
                            {servs.map((servico) => (
                              <SelectItem key={servico.id} value={servico.id}>
                                {servico.nome} - {formatarPreco(servico.preco)} (
                                {servico.duracao_minutos}min)
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="funcionario_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário Responsável {isAdmin && '*'}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || profile?.id}
                    disabled={!isAdmin}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isAdmin ? "Selecione um funcionário" : profile?.nome} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usuarios?.filter(u => u.ativo).map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nome} {usuario.role === 'admin' && '(Admin)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {servicoSelecionado && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">Duração:</span>{" "}
                  {servicoSelecionado.duracao_minutos} minutos
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Preço:</span>{" "}
                  {formatarPreco(servicoSelecionado.preco)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {horarios.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="remarcado">Remarcado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o agendamento"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gradient-pink-purple"
                disabled={createAgendamento.isPending || updateAgendamento.isPending}
              >
                {(createAgendamento.isPending || updateAgendamento.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Salvar" : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
