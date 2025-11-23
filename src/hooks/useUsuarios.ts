import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export function useUsuarios() {
  const queryClient = useQueryClient();

  // Buscar todos os funcionários
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Criar novo funcionário
  const criarUsuario = useMutation({
    mutationFn: async (dados: { email: string; senha: string; nome: string; role: 'admin' | 'funcionario' }) => {
      // Chamar Edge Function para criar usuário
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: dados.email,
            password: dados.senha,
            nome: dados.nome,
            role: dados.role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Funcionário criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar funcionário:', error);
      toast.error(error.message || 'Erro ao criar funcionário');
    },
  });

  // Atualizar funcionário
  const atualizarUsuario = useMutation({
    mutationFn: async (dados: { id: string; nome: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nome: dados.nome,
          ativo: dados.ativo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dados.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Funcionário atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error(error.message || 'Erro ao atualizar funcionário');
    },
  });

  // Desativar funcionário
  const desativarUsuario = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Funcionário desativado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao desativar funcionário:', error);
      toast.error(error.message || 'Erro ao desativar funcionário');
    },
  });

  return {
    usuarios,
    isLoading,
    criarUsuario: criarUsuario.mutate,
    atualizarUsuario: atualizarUsuario.mutate,
    desativarUsuario: desativarUsuario.mutate,
    isCriando: criarUsuario.isPending,
    isAtualizando: atualizarUsuario.isPending,
  };
}

