import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCliente } from "@/hooks/useCliente";
import { formatarPreco } from "@/lib/formatUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit, Mail, Phone, Clock, DollarSign, Award } from "lucide-react";
import { ClienteModal } from "./ClienteModal";
import { AgendamentoModal } from "../agendamentos/AgendamentoModal";

interface ClienteDetalhesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: number | null;
}

const statusColors = {
  confirmado: "bg-success/20 text-success border-success/30",
  pendente: "bg-warning/20 text-warning border-warning/30",
  cancelado: "bg-destructive/20 text-destructive border-destructive/30",
  remarcado: "bg-info/20 text-info border-info/30",
};

export const ClienteDetalhesModal = ({
  open,
  onOpenChange,
  clienteId,
}: ClienteDetalhesModalProps) => {
  const { cliente, agendamentos, isLoading } = useCliente(clienteId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);

  if (!clienteId) return null;

  const agendamentosFuturos = agendamentos?.filter(
    (ag) => new Date(ag.data!) > new Date() && ag.status !== "cancelado"
  );
  const agendamentosPassados = agendamentos?.filter(
    (ag) => new Date(ag.data!) <= new Date() || ag.status === "cancelado"
  );

  const totalGasto = agendamentosPassados
    ?.filter((ag) => ag.status === "confirmado")
    .reduce((sum, ag) => sum + Number(ag.preco || 0), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas e histórico de agendamentos
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : cliente ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="futuros">
                  Futuros ({agendamentosFuturos?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="historico">
                  Histórico ({agendamentosPassados?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card className="glass-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <h3 className="text-2xl font-bold text-gradient">{cliente.nome}</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{cliente.telefone}</span>
                        </div>
                        {cliente.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{cliente.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>

                  {cliente.observacoes && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
                    </div>
                  )}
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Visitas</p>
                        <p className="text-2xl font-bold">{cliente.total_visitas}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20 text-success">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Gasto</p>
                        <p className="text-2xl font-bold">
                          {formatarPreco(totalGasto || 0)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {cliente.ultimo_atendimento && (
                    <Card className="glass-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Último Atendimento</p>
                          <p className="text-sm font-semibold">
                            {format(new Date(cliente.ultimo_atendimento), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {cliente.servico_favorito && (
                    <Card className="glass-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/20 text-warning">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Serviço Favorito</p>
                          <p className="text-sm font-semibold">{cliente.servico_favorito}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                <Button
                  className="w-full gradient-pink-purple"
                  onClick={() => setIsAgendamentoModalOpen(true)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Novo Agendamento
                </Button>
              </TabsContent>

              <TabsContent value="futuros" className="space-y-3">
                {agendamentosFuturos && agendamentosFuturos.length > 0 ? (
                  agendamentosFuturos.map((ag) => (
                    <Card key={ag.id} className="glass-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[ag.status as keyof typeof statusColors]}>
                              {ag.status}
                            </Badge>
                            <span className="text-sm font-semibold">
                              {format(new Date(ag.data!), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="font-medium">{ag.servico_nome}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{ag.duracao_minutos} min</span>
                            <span>{formatarPreco(Number(ag.preco))}</span>
                          </div>
                          {ag.observacoes && (
                            <p className="text-sm text-muted-foreground">{ag.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento futuro
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="space-y-3">
                {agendamentosPassados && agendamentosPassados.length > 0 ? (
                  agendamentosPassados.map((ag) => (
                    <Card key={ag.id} className="glass-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[ag.status as keyof typeof statusColors]}>
                              {ag.status}
                            </Badge>
                            <span className="text-sm font-semibold">
                              {format(new Date(ag.data!), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="font-medium">{ag.servico_nome}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{ag.duracao_minutos} min</span>
                            <span>{formatarPreco(Number(ag.preco))}</span>
                          </div>
                          {ag.observacoes && (
                            <p className="text-sm text-muted-foreground">{ag.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum histórico de agendamentos
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      <ClienteModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        cliente={cliente}
      />

      <AgendamentoModal
        open={isAgendamentoModalOpen}
        onOpenChange={setIsAgendamentoModalOpen}
        clienteIdInicial={clienteId}
      />
    </>
  );
};
