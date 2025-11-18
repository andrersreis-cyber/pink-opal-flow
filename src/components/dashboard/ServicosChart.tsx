import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ServicosChartProps {
  data: any[];
  isLoading: boolean;
}

const COLORS = ['#ec4899', '#a855f7', '#8b5cf6', '#d946ef', '#f472b6'];

export const ServicosChart = ({ data, isLoading }: ServicosChartProps) => {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Serviços Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-warning" />
          Serviços Mais Populares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis type="number" stroke="#888" fontSize={12} />
            <YAxis dataKey="nome" type="category" stroke="#888" fontSize={12} width={120} />
            <Tooltip 
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              formatter={(value: number, name: string) => {
                if (name === 'total') return [`${value} agendamentos`, 'Total'];
                return [`R$ ${value.toFixed(2)}`, 'Receita'];
              }}
            />
            <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
