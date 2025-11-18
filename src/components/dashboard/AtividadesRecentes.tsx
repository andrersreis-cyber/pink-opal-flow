import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtividades } from "@/hooks/useAtividades";
import { Skeleton } from "@/components/ui/skeleton";

const tipoColors = {
  novo: "bg-primary",
  confirmacao: "bg-success",
  cancelamento: "bg-destructive",
  remarcacao: "bg-warning",
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
          <div className="space-y-4">
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
            atividades?.map((atividade) => (
              <Card key={atividade.id} className="bg-muted/30 border-0 hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        tipoColors[atividade.tipo as keyof typeof tipoColors] || "bg-muted"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{atividade.descricao}</p>
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
