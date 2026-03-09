import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, BookOpen } from "lucide-react";

interface AlumnoCardProps {
  nombre: string;
  matricula: string;
  grupo: string;
  estado: string;
}

const estadoConfig: Record<string, { label: string; className: string }> = {
  activo: { label: "Activo", className: "bg-success text-success-foreground" },
  inactivo: { label: "Inactivo", className: "bg-muted text-muted-foreground" },
  baja: { label: "Baja", className: "bg-destructive text-destructive-foreground" },
};

const AlumnoCard = ({ nombre, matricula, grupo, estado }: AlumnoCardProps) => {
  const config = estadoConfig[estado] ?? estadoConfig.inactivo;

  return (
    <Card className="max-w-md w-full border border-border shadow-sm">
      <CardContent className="p-8 space-y-6">
        {/* Header line */}
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium">
            {matricula}
          </span>
          <Badge className={config.className}>{config.label}</Badge>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Name */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="text-[11px] uppercase tracking-[0.2em]">Nombre</span>
          </div>
          <p className="text-lg font-medium tracking-tight">{nombre}</p>
        </div>

        {/* Group */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-[11px] uppercase tracking-[0.2em]">Grupo</span>
          </div>
          <p className="text-lg font-medium tracking-tight">{grupo}</p>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 w-12 bg-accent rounded-full" />
      </CardContent>
    </Card>
  );
};

export default AlumnoCard;
