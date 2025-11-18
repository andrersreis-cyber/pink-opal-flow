import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Historico = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Histórico de Conversas</h1>
        <p className="text-muted-foreground mt-2">Visualize o histórico de atendimentos</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Conversas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma conversa registrada</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Historico;
