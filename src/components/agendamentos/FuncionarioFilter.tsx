import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useAuth } from "@/hooks/useAuth";
import { Users } from "lucide-react";

interface FuncionarioFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const FuncionarioFilter = ({ value, onChange }: FuncionarioFilterProps) => {
  const { profile } = useAuth();
  const { usuarios } = useUsuarios();

  // Não mostrar filtro para funcionários (só admin)
  if (profile?.role !== 'admin') return null;

  return (
    <Select
      value={value || 'todos'}
      onValueChange={(v) => onChange(v === 'todos' ? null : v)}
    >
      <SelectTrigger className="w-[220px]">
        <Users className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Filtrar por funcionário" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">✅ Todos os Funcionários</SelectItem>
        {usuarios?.filter(u => u.ativo).map((user) => (
          <SelectItem key={user.id} value={user.id}>
            👤 {user.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

