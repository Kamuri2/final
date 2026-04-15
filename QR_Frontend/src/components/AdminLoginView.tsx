import { useState } from "react";
import ValidationCard from "./ValidationCard";

interface AdminLoginProps {
    onLoginSuccess: (rol: string) => void;
    onBack: () => void;
}

const AdminLoginView = ({ onLoginSuccess, onBack }: AdminLoginProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) return alert("Ingresa tus datos, Kevin.");
        setLoading(true);

        // 🛰️ ESTA ES LA MUTACIÓN REAL QUE DEFINISTE EN TU RESOLVER
        const GQL_LOGIN = {
            query: `
        mutation RealLogin($u: String!, $p: String!) {
          login(username: $u, password: $p) {
            token
            rol
            id
          }
        }
      `,
            variables: { u: username, p: password }
        };

        try {
            const response = await fetch('https://api-fraktalid.utvt.cloud/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(GQL_LOGIN),
            });

            const result = await response.json();

            if (result.errors) {
                // El servidor dice que no coinciden
                alert(`❌ Error : ${result.errors[0].message}`);
            } else if (result.data?.login) {
                const { rol, token } = result.data.login;

                // Guardamos el token real por seguridad
                localStorage.setItem('raven_token', token);

                // Si es ADMIN, lo dejamos pasar al Dashboard
                if (rol === 'ADMIN') {
                    onLoginSuccess(rol);
                } else {
                    alert("⚠️ Este acceso es exclusivo para Administradores.");
                }
            }
        } catch (error) {
            alert("No hay conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <ValidationCard className="p-10 w-full border-[#B08D6D]/20 bg-black/60 backdrop-blur-2xl rounded-3xl text-center shadow-2xl">
                <div className="mb-8">
                    <div className="text-[#B08D6D] text-5xl mb-4 animate-pulse">🔐</div>
                    <h2 className="text-2xl font-bold text-white font-jp tracking-tighter uppercase">Qrify Admin</h2>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] mt-2">INGRESE CREDENCIALES MAESTRAS</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="USUARIO"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-black text-xs outline-none focus:border-[#B08D6D] transition-all placeholder:text-white/20"
                    />
                    <input
                        type="password"
                        placeholder="CONTRASEÑA"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white5 border border-white/10 p-4 rounded-xl text-black  text-xs  outline-none focus:border-[#B08D6D] transition-all placeholder:text-white/20"
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-[#B08D6D] text-black font-black p-4 rounded-xl tracking-[0.2em] text-xs hover:bg-[#8e7158] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? "VERIFICANDO..." : "AUTENTICAR"}
                    </button>
                </div>
            </ValidationCard>
        </div>
    );
};

export default AdminLoginView;