import { Calendar, CalendarDays, CalendarRange, Home, Users, History, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export const Sidebar = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/agenda/dia", icon: Calendar, label: "Agenda Dia" },
    { to: "/agenda/semana", icon: CalendarDays, label: "Agenda Semana" },
    { to: "/agenda/mes", icon: CalendarRange, label: "Agenda Mês" },
    { to: "/clientes", icon: Users, label: "Clientes" },
    { to: "/historico", icon: History, label: "Histórico" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-border/50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-pink-purple">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Liz Martins</h1>
              <p className="text-xs text-muted-foreground">Estética Avançada</p>
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
        </nav>
      </div>
    </aside>
  );
};
