import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtividades } from "@/hooks/useAtividades";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, CheckCircle2, XCircle, Calendar } from "lucide-react";

const tipoIcons = {
  novo: Sparkles,
  confirmacao: CheckCircle2,
  cancelamento: XCircle,
  remarcacao: Calendar,
};

const tipoColors = {
  novo: "text-primary",
  confirmacao: "text-success",
  cancelamento: "text-destructive",
  remarcacao: "text-warning",
};

const tipoLabels = {
  novo: "Novo agendamento",
  confirmacao: "Confirmado",
  cancelamento: "Cancelado",
  remarcacao: "Remarcado",
};

export const AtividadesRecentes = () => {
  const { atividades, isLoading } = useAtividades();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {atividades?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            atividades?.map((atividade) => {
              const Icon =
                tipoIcons[atividade.tipo as keyof typeof tipoIcons] || Sparkles;
              const colorClass =
                tipoColors[atividade.tipo as keyof typeof tipoColors] ||
                "text-muted-foreground";
              const label =
                tipoLabels[atividade.tipo as keyof typeof tipoLabels] ||
                atividade.tipo;

              return (
                <Card
                  key={atividade.id}
                  className="bg-muted/30 border-0 hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3 items-start">
                      <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {atividade.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(atividade.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

