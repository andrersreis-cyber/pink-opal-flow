import { useState } from "react";
import { Users, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientes } from "@/hooks/useClientes";
import { Skeleton } from "@/components/ui/skeleton";

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientes, isLoading } = useClientes();

  const filteredClientes = clientes?.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gerencie seus clientes</p>
        </div>
        <Button className="gradient-pink-purple">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredClientes?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes?.map((cliente) => (
            <Card key={cliente.id} className="glass-card hover:glow-pink transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{cliente.nome}</h3>
                    <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                    {cliente.email && (
                      <p className="text-sm text-muted-foreground">{cliente.email}</p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Visitas: </span>
                        <span className="font-semibold text-foreground">{cliente.total_visitas}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clientes;
