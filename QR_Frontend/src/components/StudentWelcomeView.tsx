import { CheckCircle2, User, BookOpen, Calendar, Hash, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ============================================
// INTERFAZ DE DATOS DEL ESTUDIANTE
// Estos datos vendrán de tu API/Base de datos
// Modifica los campos según tu esquema real
// ============================================
export interface StudentData {
  nombre: string;
  matricula: string;
  carrera: string;
  semestre: number;
  activo: boolean; // 🛡️ Lo dejaremos como boolean para el Badge
  turno: string;
  fechaIngreso: string;
}

// ============================================
// DATOS DE SIMULACIÓN - REEMPLAZAR CON DATOS REALES
// ============================================
export const MOCK_STUDENT: StudentData = {
  nombre: "Carlos Martínez López",
  matricula: "2024-0158",
  carrera: "Ingeniería en Sistemas",
  semestre: 4,
  activo: true,
  turno: "Matutino",
  fechaIngreso: "Agosto 2022",
};

interface StudentWelcomeViewProps {
  student: StudentData;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
      <span className="text-xs font-light">{label}</span>
    </div>
    <span className="text-sm text-foreground font-medium">{value}</span>
  </div>
);

const StudentWelcomeView = ({ student }: StudentWelcomeViewProps) => {
  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-matcha-light">
          <CheckCircle2 className="w-7 h-7 text-matcha-vivid" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-light font-jp">
            ようこそ
          </p>
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            Bienvenido
          </h2>
          <p className="text-lg font-semibold text-foreground">{student.nombre}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] text-muted-foreground font-jp">学生情報</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Student Info */}
      <div className="rounded-xl bg-background/50 border border-border/40 px-4 py-1">
        <InfoRow icon={Hash} label="Matrícula" value={student.matricula} />
        <InfoRow icon={BookOpen} label="Carrera" value={student.carrera} />
        <InfoRow
          icon={Calendar}
          label="Semestre"
          value={`${student.semestre}°`}
        />
        <InfoRow icon={User} label="Turno" value={student.turno} />
        <InfoRow icon={Calendar} label="Ingreso" value={student.fechaIngreso} />
        <InfoRow
          icon={ShieldCheck}
          label="Estado"
          value={
            <Badge
              variant={student.activo ? "default" : "destructive"}
              className={
                student.activo
                  ? "bg-matcha text-matcha-foreground hover:bg-matcha/90 text-[10px]"
                  : "text-[10px]"
              }
            >
              {student.activo ? "Activo" : "Inactivo"}
            </Badge>
          }
        />
      </div>
    </div>
  );
};

export default StudentWelcomeView;
