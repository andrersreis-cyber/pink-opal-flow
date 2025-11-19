import { useState } from "react";
import { MessageSquare, Search, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversas } from "@/hooks/useConversas";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Historico = () => {
  const { conversas, isLoading, filtro, setFiltro } = useConversas();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleConversa = (key: string) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded(next);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Histórico de Conversas</h1>
        <p className="text-muted-foreground mt-2">Visualize o histórico de atendimentos</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Conversas</CardTitle>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por cliente ou telefone..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !conversas || conversas.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filtro ? "Nenhuma conversa encontrada" : "Nenhuma conversa registrada"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversas.map((conversa) => {
                const key = (conversa.cliente_id ?? conversa.telefone ?? "sem-chave").toString();
                const isExpanded = expanded.has(key);

                return (
                  <Card key={key} className="bg-muted/30 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">
                              {conversa.cliente_nome}
                            </h3>
                            {conversa.telefone && (
                              <Badge variant="outline" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                {conversa.telefone}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {conversa.total_mensagens} mensagem(ns)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Última atividade: {" "}
                            {formatDistanceToNow(new Date(conversa.ultima_mensagem), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>

                          {isExpanded && (
                            <div className="mt-4 space-y-3 border-t pt-3 max-h-64 overflow-y-auto">
                              {conversa.mensagens.map((msg: any) => (
                                <div
                                  key={msg.id}
                                  className={`p-3 rounded-lg text-sm ${
                                    msg.direcao === "incoming"
                                      ? "bg-primary/10 mr-8"
                                      : "bg-muted ml-8"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge
                                      variant={
                                        msg.direcao === "incoming" ? "default" : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {msg.direcao === "incoming" ? "Cliente" : "Bot"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(msg.created_at), {
                                        addSuffix: true,
                                        locale: ptBR,
                                      })}
                                    </span>
                                  </div>
                                  <p>
                                    {msg.direcao === "incoming"
                                      ? msg.mensagem_usuario
                                      : msg.mensagem_bot}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleConversa(key)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Historico;

