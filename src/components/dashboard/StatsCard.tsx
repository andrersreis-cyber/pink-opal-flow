import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  variant: "pink" | "purple" | "green" | "yellow";
  onClick?: () => void;
}

const variantStyles = {
  pink: "bg-primary/20 text-primary",
  purple: "bg-secondary/20 text-secondary",
  green: "bg-success/20 text-success",
  yellow: "bg-warning/20 text-warning",
};

export const StatsCard = ({ icon: Icon, title, value, variant, onClick }: StatsCardProps) => {
  return (
    <Card className="glass-card p-6 hover:glow-pink transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${variantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
};
