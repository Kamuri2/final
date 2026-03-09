import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_ALUMNO } from "@/graphql/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AlumnoCard from "@/components/AlumnoCard";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, Search } from "lucide-react";

const AlumnoPage = () => {
  const [matricula, setMatricula] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [buscarAlumno, { data, loading, error }] = useLazyQuery<{ alumno: { matricula: string; nombre_completo: string; grupo: { nombre: string } | null; estado: string } }>(GET_ALUMNO);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = matricula.trim();
    if (!trimmed) return;
    buscarAlumno({ variables: { matricula: trimmed } });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const alumno = data?.alumno;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">学</span>
            </div>
            <span className="text-sm font-medium tracking-wide">Consulta Académica</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-medium tracking-tight">Buscar Alumno</h2>
            <p className="text-sm text-muted-foreground mt-1">Ingresa tu matrícula para consultar tu información</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Matrícula (ej. 2024001)"
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </form>

          {error && (
            <p className="text-sm text-destructive">No se encontró el alumno o hubo un error.</p>
          )}

          {alumno && (
            <div className="flex justify-center pt-4">
              <AlumnoCard
                nombre={alumno.nombre_completo}
                matricula={alumno.matricula}
                grupo={alumno.grupo?.nombre ?? "Sin grupo"}
                estado={alumno.estado}
              />
            </div>
          )}

          {!alumno && !loading && !error && data && (
            <p className="text-sm text-muted-foreground text-center">No se encontraron resultados.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlumnoPage;
