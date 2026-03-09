import { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. CORRECCIÓN VITAL: La importación correcta para evitar errores de Vite
import { useMutation } from "@apollo/client/react"; 
import { LOGIN_USUARIO } from "@/graphql/mutations";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginMutation, { loading }] = useMutation(LOGIN_USUARIO, {
    onCompleted: (data: { loginUsuario: { token: string; rol: string } }) => {
      const { token, rol } = data.loginUsuario;
      
      // Guardamos en tu contexto de autenticación
      login(token, rol);
      
      // 2. ATENCIÓN AQUÍ: Asegúrate de que tu backend NestJS devuelva exactamente 
      // la palabra "Administrador" o "admin" según como lo hayas configurado
      // En nuestra base de datos pusimos "Administrador", así que ajustamos la ruta:
      navigate(rol === "Administrador" || rol === "admin" ? "/admin" : "/alumno");
    },
    onError: (err) => {
      toast({
        title: "Error de acceso",
        description: err.message || "Credenciales inválidas",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    loginMutation({ variables: { username: username.trim(), password } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary text-primary-foreground mb-4">
            <span className="text-lg font-bold">学</span>
          </div>
          {/* 3. Personalizamos el título para tu proyecto */}
          <h1 className="text-2xl font-medium tracking-tight">Raven Login</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Usuario
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. RavenAdmin"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? "Verificando Conttraseña..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground tracking-wide">
          管理システム — Raven ID v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;