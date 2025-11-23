import { Calendar, CalendarDays, CalendarRange, Home, Users, History, Sparkles, LogOut, UserCog } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Sidebar = () => {
  const { profile, signOut, isAdmin } = useAuth();

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/agenda/dia", icon: Calendar, label: "Agenda Dia" },
    { to: "/agenda/semana", icon: CalendarDays, label: "Agenda Semana" },
    { to: "/agenda/mes", icon: CalendarRange, label: "Agenda Mês" },
    { to: "/clientes", icon: Users, label: "Clientes" },
    { to: "/historico", icon: History, label: "Histórico" },
  ];

  // Item de Equipe - visível apenas para admin
  const adminItems = [
    { to: "/equipe", icon: UserCog, label: "Equipe" },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-border/50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-pink-purple">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">
                {profile?.nome || 'Pink Opal Flow'}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.role === 'admin' ? 'Administradora' : 'Estética Avançada'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 transition-all"
              activeClassName="gradient-pink-purple text-white glow-pink"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          {/* Itens visíveis apenas para admin */}
          {isAdmin && (
            <>
              <div className="border-t border-border/50 my-2" />
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 transition-all"
                  activeClassName="gradient-pink-purple text-white glow-pink"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border/50">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};
