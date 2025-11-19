import { useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversas } from "@/hooks/useConversas";
import { ConversaCard } from "@/components/historico/ConversaCard";
import { ConversaDetalhesModal } from "@/components/historico/ConversaDetalhesModal";
import type { ConversationHistory } from "@/types";

const Historico = () => {
  const { conversas, isLoading } = useConversas();
  const [filtro, setFiltro] = useState("");
  const [conversaSelecionada, setConversaSelecionada] = useState<ConversationHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (conversa: ConversationHistory) => {
    setConversaSelecionada(conversa);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Histórico de Conversas</h1>
          <p className="text-muted-foreground mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  const conversasFiltradas = conversas?.filter((conversa) => {
    if (!filtro) return true;
    const searchTerm = filtro.toLowerCase();
    return (
      conversa.clientName?.toLowerCase().includes(searchTerm) ||
      conversa.telefone?.toLowerCase().includes(searchTerm)
    );
  });

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : !conversasFiltradas || conversasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filtro ? "Nenhuma conversa encontrada" : "Nenhuma conversa registrada"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {conversasFiltradas.map((conversa) => (
                <ConversaCard
                  key={conversa.cliente_id || conversa.telefone}
                  conversa={conversa}
                  onClick={() => handleCardClick(conversa)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConversaDetalhesModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        conversa={conversaSelecionada}
      />
    </div>
  );
};

export default Historico;

