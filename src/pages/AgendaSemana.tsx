import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgendaSemana = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Agenda da Semana</h1>
        <p className="text-muted-foreground mt-2">Visualização semanal dos agendamentos</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Calendário Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Visualização semanal em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaSemana;
