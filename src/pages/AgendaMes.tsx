import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgendaMes = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Agenda do Mês</h1>
        <p className="text-muted-foreground mt-2">Visualização mensal dos agendamentos</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Calendário Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Visualização mensal em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaMes;
