import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CREATE_ALUMNO } from "@/graphql/mutations";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogOut, UserPlus } from "lucide-react";

const alumnoSchema = z.object({
  matricula: z.string().trim().min(1, "La matrícula es obligatoria").max(20, "Máximo 20 caracteres"),
  nombre_completo: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  id_grupo: z.string().min(1, "Selecciona un grupo"),
  estado: z.string().min(1, "Selecciona un estado"),
});

type AlumnoFormData = z.infer<typeof alumnoSchema>;

const grupos = [
  { id: "5", nombre: "DSM 52" },
  { id: "6", nombre: "DSM 54" },
  { id: "7", nombre: "IRD 52" },
];

const Admin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<AlumnoFormData>({
    resolver: zodResolver(alumnoSchema),
    defaultValues: { matricula: "", nombre_completo: "", id_grupo: "", estado: "" },
  });

  const [createAlumno, { loading }] = useMutation(CREATE_ALUMNO, {
    onCompleted: () => {
      toast({ title: "登録完了", description: "Alumno registrado correctamente" });
      form.reset();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // ✅ CÓDIGO CORREGIDO
const onSubmit = (data: AlumnoFormData) => {
  createAlumno({
    variables: {
      createAlumnoInput: {
        matricula: data.matricula,
        nombre_completo: data.nombre_completo,
        // Tu formulario lo llama id_grupo, pero el backend pide grupo_id
        grupo_id: parseInt(data.id_grupo, 10), 
        // Tu formulario lo llama estado, pero el backend pide estado_academico
        estado_academico: data.estado 
      }
    },
  });
};
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">管</span>
            </div>
            <span className="text-sm font-medium tracking-wide">Panel Administrativo</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium tracking-tight">Registro de Alumno</h2>
            <p className="text-sm text-muted-foreground mt-1">Completa los datos para crear un nuevo registro</p>
          </div>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Matrícula
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 2024001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombre_completo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Nombre Completo
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre y apellidos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_grupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Grupo
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar grupo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grupos.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Estado
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="inactivo">Inactivo</SelectItem>
                            <SelectItem value="baja">Baja</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loading ? "Registrando..." : "Registrar Alumno"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
