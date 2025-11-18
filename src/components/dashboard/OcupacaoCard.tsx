import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OcupacaoCardProps {
  data: any;
  isLoading: boolean;
}

export const OcupacaoCard = ({ data, isLoading }: OcupacaoCardProps) => {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Taxa de Ocupação Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getColorClass = (percentual: number) => {
    if (percentual >= 80) return 'text-success';
    if (percentual >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Taxa de Ocupação Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Agenda ocupada</span>
          <span className={`text-3xl font-bold ${getColorClass(data?.percentual || 0)}`}>
            {data?.percentual || 0}%
          </span>
        </div>
        
        <Progress value={data?.percentual || 0} className="h-3" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Tempo ocupado</p>
            <p className="font-semibold">{data?.minutosOcupados || 0} min</p>
          </div>
          <div>
            <p className="text-muted-foreground">Agendamentos</p>
            <p className="font-semibold">{data?.agendamentos || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
