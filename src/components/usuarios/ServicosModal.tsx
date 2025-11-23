import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, Award } from "lucide-react";
import { useFuncionarioServicos } from "@/hooks/useFuncionarioServicos";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServicosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionarioId: string;
  funcionarioNome: string;
}

export const ServicosModal = ({
  open,
  onOpenChange,
  funcionarioId,
  funcionarioNome,
}: ServicosModalProps) => {
  const [filtro, setFiltro] = useState("");
  const { servicosComVinculo, isLoadingServicos, toggleServico, atualizarNivelHabilidade } =
    useFuncionarioServicos(funcionarioId);

  const servicosFiltrados = servicosComVinculo?.filter((servico) =>
    servico.servico_nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalVinculados = servicosComVinculo?.filter((s) => s.vinculado).length ?? 0;
  const totalServicos = servicosComVinculo?.length ?? 0;

  const handleToggleServico = async (
    servicoId: string,
    vinculado: boolean,
    nivelAtual?: string
  ) => {
    await toggleServico(
      funcionarioId,
      servicoId,
      vinculado,
      (nivelAtual as "basico" | "avancado") ?? "basico"
    );
  };

  const handleChangeNivel = async (servicoId: string, novoNivel: "basico" | "avancado") => {
    await atualizarNivelHabilidade.mutateAsync({
      funcionarioId,
      servicoId,
      nivelHabilidade: novoNivel,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Gerenciar Serviços - {funcionarioNome}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="text-sm">
              {totalVinculados} de {totalServicos} serviços habilitados
            </Badge>
          </div>
        </DialogHeader>

        {/* Filtro */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar serviço..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Serviços */}
        <ScrollArea className="h-[450px] pr-4">
          {isLoadingServicos ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : servicosFiltrados && servicosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {servicosFiltrados?.map((servico) => (
                <div
                  key={servico.servico_id}
                  className={`p-4 rounded-lg border transition-all ${
                    servico.vinculado
                      ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30"
                      : "bg-card border-border hover:border-pink-500/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      checked={servico.vinculado}
                      onCheckedChange={() =>
                        handleToggleServico(
                          servico.servico_id,
                          servico.vinculado,
                          servico.nivel_habilidade
                        )
                      }
                      className="mt-1"
                    />

                    {/* Informações do Serviço */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base">{servico.servico_nome}</h3>
                        {servico.vinculado && (
                          <Badge
                            variant={
                              servico.nivel_habilidade === "avancado" ? "default" : "outline"
                            }
                            className={
                              servico.nivel_habilidade === "avancado"
                                ? "gradient-pink-purple"
                                : ""
                            }
                          >
                            {servico.nivel_habilidade === "avancado" ? (
                              <>
                                <Award className="h-3 w-3 mr-1" />
                                Avançado
                              </>
                            ) : (
                              <>
                                <Star className="h-3 w-3 mr-1" />
                                Básico
                              </>
                            )}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>R$ {servico.servico_preco.toFixed(2)}</span>
                        <span>•</span>
                        <span>{servico.servico_duracao} min</span>
                      </div>

                      {/* Selector de Nível */}
                      {servico.vinculado && (
                        <div className="mt-3">
                          <Select
                            value={servico.nivel_habilidade}
                            onValueChange={(value: "basico" | "avancado") =>
                              handleChangeNivel(servico.servico_id, value)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basico">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4" />
                                  Nível Básico
                                </div>
                              </SelectItem>
                              <SelectItem value="avancado">
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4" />
                                  Nível Avançado
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

