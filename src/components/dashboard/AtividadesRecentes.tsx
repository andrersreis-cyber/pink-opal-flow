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
        <div className="space-y-4">
          {atividades?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            atividades?.map((atividade) => (
              <div key={atividade.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      tipoColors[atividade.tipo as keyof typeof tipoColors] || "bg-muted"
                    }`}
                  />
                  <div className="w-px h-full bg-border mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-foreground">{atividade.descricao}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(atividade.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
