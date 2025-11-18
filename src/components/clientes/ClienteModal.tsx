import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useClientes } from "@/hooks/useClientes";
import { formatarTelefone, limparTelefone } from "@/lib/formatUtils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const clienteSchema = z.object({
  nome: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  telefone: z.string()
    .min(1, "Telefone é obrigatório")
    .refine(
      (val) => {
        const cleaned = limparTelefone(val);
        return cleaned.length >= 10 && cleaned.length <= 11;
      },
      { message: "Telefone inválido (use formato brasileiro)" }
    ),
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal(""))
    .nullable(),
  observacoes: z.string().optional().nullable(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: {
    id: number;
    nome: string;
    telefone: string;
    email?: string | null;
    observacoes?: string | null;
  } | null;
}

export const ClienteModal = ({ open, onOpenChange, cliente }: ClienteModalProps) => {
  const { createCliente, updateCliente } = useClientes();
  const isEditing = !!cliente;

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (cliente) {
      form.reset({
        nome: cliente.nome,
        telefone: formatarTelefone(cliente.telefone),
        email: cliente.email || "",
        observacoes: cliente.observacoes || "",
      });
    } else {
      form.reset({
        nome: "",
        telefone: "",
        email: "",
        observacoes: "",
      });
    }
  }, [cliente, form]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      const clienteData = {
        nome: data.nome.trim(),
        telefone: limparTelefone(data.telefone),
        email: data.email || undefined,
        observacoes: data.observacoes || undefined,
      };

      if (isEditing) {
        await updateCliente.mutateAsync({
          id: cliente.id,
          ...clienteData,
        });
      } else {
        await createCliente.mutateAsync(clienteData);
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(error.message || "Erro ao salvar cliente");
    }
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatarTelefone(value);
    form.setValue("telefone", formatted, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cliente"
              : "Preencha os dados para cadastrar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
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
                      placeholder="Informações adicionais sobre o cliente"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gradient-pink-purple"
                disabled={createCliente.isPending || updateCliente.isPending}
              >
                {(createCliente.isPending || updateCliente.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Salvar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
