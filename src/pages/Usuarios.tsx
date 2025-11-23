import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Shield, ShieldCheck, UserX, Loader2, Settings } from 'lucide-react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { UserModal } from '@/components/usuarios/UserModal';
import { ServicosModal } from '@/components/usuarios/ServicosModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Usuarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [servicosModalOpen, setServicosModalOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<{ id: string; nome: string } | null>(null);
  const { usuarios, isLoading, criarUsuario, isCriando, desativarUsuario } = useUsuarios();

  const handleCriarUsuario = (dados: { email: string; senha: string; nome: string; role: 'admin' | 'funcionario' }) => {
    criarUsuario(dados, {
      onSuccess: () => {
        setModalOpen(false);
      },
    });
  };

  const handleAbrirServicos = (id: string, nome: string) => {
    setFuncionarioSelecionado({ id, nome });
    setServicosModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">Gerencie os membros da sua equipe</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* Lista de Usuários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {usuarios?.map((usuario) => (
          <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                    {usuario.nome?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {usuario.email}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {usuario.role === 'admin' ? (
                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium">
                    {usuario.role === 'admin' ? 'Administrador' : 'Funcionário'}
                  </span>
                </div>
                <Badge variant={usuario.ativo ? 'default' : 'secondary'} className={usuario.ativo ? 'bg-green-500' : ''}>
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {usuario.created_at && (
                <p className="text-xs text-muted-foreground">
                  Cadastrado em {format(new Date(usuario.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}

              {usuario.ativo && (
                <div className="space-y-2 mt-2">
                  {/* Botão Gerenciar Serviços */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAbrirServicos(usuario.id, usuario.nome)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar Serviços
                  </Button>

                  {/* Botão Desativar (apenas para funcionários) */}
                  {usuario.role !== 'admin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => desativarUsuario(usuario.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Desativar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {usuarios?.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum funcionário cadastrado ainda.</p>
            <Button
              onClick={() => setModalOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Adicionar Primeiro Funcionário
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCriarUsuario}
        isLoading={isCriando}
      />

      {/* Modal de Gestão de Serviços */}
      {funcionarioSelecionado && (
        <ServicosModal
          open={servicosModalOpen}
          onOpenChange={setServicosModalOpen}
          funcionarioId={funcionarioSelecionado.id}
          funcionarioNome={funcionarioSelecionado.nome}
        />
      )}
    </div>
  );
}

