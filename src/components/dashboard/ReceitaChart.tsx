import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReceitaChartProps {
  data: any[];
  isLoading: boolean;
}

export const ReceitaChart = ({ data, isLoading }: ReceitaChartProps) => {
  if (isLoading) {
    return (
      <Card className="glass-card col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Receita (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalPrevista = data?.reduce((acc, d) => acc + d.prevista, 0) || 0;
  const totalRealizada = data?.reduce((acc, d) => acc + d.realizada, 0) || 0;
  const diferenca = totalRealizada - totalPrevista;
  const percentual = totalPrevista > 0 ? ((diferenca / totalPrevista) * 100).toFixed(1) : 0;

  return (
    <Card className="glass-card col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Receita (Últimos 30 dias)
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground">Prevista</p>
              <p className="font-bold text-pink-500">R$ {totalPrevista.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Realizada</p>
              <p className="font-bold text-success">R$ {totalRealizada.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Diferença</p>
              <p className={`font-bold flex items-center gap-1 ${Number(percentual) >= 0 ? 'text-success' : 'text-destructive'}`}>
                <TrendingUp className="h-4 w-4" />
                {percentual}%
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrevista" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRealizada" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="dia" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip 
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="prevista" 
              stroke="#ec4899" 
              fillOpacity={1} 
              fill="url(#colorPrevista)"
              name="Prevista"
            />
            <Area 
              type="monotone" 
              dataKey="realizada" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorRealizada)"
              name="Realizada"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
