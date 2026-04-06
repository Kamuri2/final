import { useState, useCallback } from "react";
import ValidationCard from "@/components/ValidationCard";
import SuccessView from "@/components/SuccessView";
import ErrorView from "@/components/ErrorView";
import TrainGateAnimation from "@/components/TrainGateAnimation";
import QRScanner from "@/components/QRScanner";
import StudentWelcomeView, { type StudentData } from "@/components/StudentWelcomeView";
import AdminDashboardView from "@/components/AdminDashboardView";

type AppMode = "selection" | "validator" | "admin";
type ViewState = "form" | "success" | "error";

const Index = () => {
  const [appMode, setAppMode] = useState<AppMode>("selection");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const [view, setView] = useState<ViewState>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gateActive, setGateActive] = useState(false);
  const [gateType, setGateType] = useState<"success" | "error">("success");
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  // --- 🔐 LOGIN REAL (RAVEN ADMIN) ---
  const handleAdminLogin = async () => {
    if (!adminUser || !adminPass) return alert("Por favor, ingresa tus credenciales.");

    const GQL_LOGIN = {
      query: `
        mutation LoginAdmin($u: String!, $p: String!) {
          login(username: $u, password: $p) {
            token
            rol
            id
          }
        }
      `,
      variables: { u: adminUser, p: adminPass }
    };

    try {
      const response = await fetch('http://192.168.100.6:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(GQL_LOGIN),
      });

      const result = await response.json();

      if (result.errors) {
        alert(`❌ ${result.errors[0].message}`);
      } else if (result.data?.login) {
        const { rol, token } = result.data.login;
        if (rol === 'ADMIN') {
          localStorage.setItem('raven_token', token);
          setIsAdminAuthenticated(true);
        } else {
          alert("⚠️ Acceso denegado: No tienes permisos de administrador.");
        }
      }
    } catch (error) {
      alert("⚠️ Error de conexión con el servidor RavenID.");
    }
  };

  // --- 🛡️ VALIDACIÓN DE QR ---
  const handleValidation = async (credential: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const GQL_MUTATION = {
      query: `
        mutation Validar($hash: String!, $pId: Int!, $vId: Int!) {
          validarAcceso(qr_hash: $hash, puntoId: $pId, verificadorId: $vId) {
            valido mensaje alumno { nombre_completo matricula carrera semestre }
          }
        }
      `,
      variables: { hash: credential, pId: 1, vId: 2 }
    };
    try {
      const response = await fetch('http://192.168.100.6:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(GQL_MUTATION),
      });
      const result = await response.json();
      const res = result.data.validarAcceso;
      if (res.valido && res.alumno) {
        setGateType("success");
        setStudentData({
          nombre: res.alumno.nombre_completo,
          matricula: res.alumno.matricula,
          carrera: res.alumno.carrera,
          semestre: res.alumno.semestre,
          activo: true, turno: "Matutino", fechaIngreso: "2024"
        });
      } else {
        setGateType("error");
      }
      setGateActive(true);
    } catch (error: any) {
      setGateType("error");
      setGateActive(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGateComplete = useCallback(() => {
    setGateActive(false);
    setView(gateType === "success" ? "success" : "error");
    setTimeout(() => {
      setView("form");
      setStudentData(null);
    }, 4000);
  }, [gateType]);

  return (
    <>
      <TrainGateAnimation isActive={gateActive} type={gateType} onComplete={handleGateComplete} />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0A0A0A]">
        <div className="fixed inset-0 asanoha-pattern opacity-10 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-tr from-black via-[#0f0f0f] to-[#1a1a0a] pointer-events-none" />

        <div className={`relative z-10 w-full flex flex-col items-center ${appMode === 'admin' && isAdminAuthenticated ? 'max-w-7xl' : 'max-w-[600px]'}`}>

          {/* --- 1. SELECCIÓN --- */}
          {appMode === "selection" && (
            <div className="w-full animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center">
              <img src="/ICONO-WHRITE.png" alt="Logo" className="w-80 h-80 mb-10 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl" />
              <h1 className="text-3xl font-black text-white tracking-[0.3em] mb-12 font-jp uppercase">RavenID System</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                <button onClick={() => setAppMode("validator")} className="group relative p-8 border border-[#B08D6D]/20 bg-black/40 backdrop-blur-xl rounded-3xl transition-all hover:border-[#B08D6D] hover:scale-105">
                  <h2 className="text-lg font-bold text-white tracking-widest uppercase">Validación</h2>
                </button>
                <button onClick={() => setAppMode("admin")} className="group relative p-8 border border-[#B08D6D]/20 bg-black/40 backdrop-blur-xl rounded-3xl transition-all hover:border-[#B08D6D] hover:scale-105">
                  <h2 className="text-lg font-bold text-white tracking-widest uppercase">Admin</h2>
                </button>
              </div>
            </div>
          )}

          {/* --- 2. VALIDADOR --- */}
          {appMode === "validator" && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              {/* BOTÓN REGRESO VISIBLE */}
              <div className="w-full flex justify-start mb-6">
                <button onClick={() => setAppMode("selection")} className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase hover:text-white transition-all flex items-center gap-2">
                  <span className="text-lg">←</span> VOLVER AL INICIO
                </button>
              </div>

              <div className="mb-6 relative">
                <div className="absolute -inset-4 bg-[#B08D6D] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <img src="/ICONO.png" alt="Logo" className="relative w-64 h-64 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl object-cover" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-white tracking-[0.2em] mb-2 font-jp uppercase text-center">Bienvenido</h2>
                <p className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase">Coloque su código frente a la cámara</p>
              </div>

              <ValidationCard className="w-full border-[#B08D6D]/20 bg-black/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
                {view === "form" && (
                  <div className="p-2">
                    <div className="relative rounded-2xl overflow-hidden border border-white/5">
                      <QRScanner onResult={handleValidation} />
                    </div>
                  </div>
                )}
                {view === "success" && studentData && <StudentWelcomeView student={studentData} />}
                {view === "error" && <ErrorView onRetry={() => setView("form")} />}
              </ValidationCard>
            </div>
          )}

          {/* --- 3. ADMIN --- */}
          {appMode === "admin" && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              {/* BOTÓN REGRESO / CERRAR SESIÓN */}
              <div className="w-full flex justify-start mb-6">
                <button
                  onClick={() => { setAppMode("selection"); setIsAdminAuthenticated(false); }}
                  className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase hover:text-white transition-all flex items-center gap-2"
                >
                  <span className="text-lg">←</span> {isAdminAuthenticated ? "CERRAR SESIÓN" : "VOLVER AL INICIO"}
                </button>
              </div>

              {!isAdminAuthenticated ? (
                <div className="w-full flex flex-col items-center">
                  <div className="mb-6 relative">
                    <div className="absolute -inset-4 bg-[#B08D6D] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <img src="/ICONO.png" alt="Logo" className="relative w-64 h-64 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl object-cover" />
                  </div>
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-white tracking-[0.2em] mb-2 font-jp uppercase">Admin Login</h2>
                    <p className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase">GESTIÓN</p>
                  </div>
                  <div className="w-full max-w-md">
                    <ValidationCard className="p-10 w-full border-[#B08D6D]/20 bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl">
                      <div className="space-y-4">
                        <input type="text" placeholder="USUARIO" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-xs outline-none focus:border-[#B08D6D]" />
                        <input type="password" placeholder="CONTRASEÑA" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-xs outline-none focus:border-[#B08D6D]" />
                        <button onClick={handleAdminLogin} className="w-full bg-[#B08D6D] text-black font-black p-4 rounded-xl tracking-[0.2em] text-xs hover:bg-[#8e7158] transition-all">ENTRAR AL PANEL</button>
                      </div>
                    </ValidationCard>
                  </div>
                </div>
              ) : (
                <AdminDashboardView />
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 flex flex-col items-center gap-2 opacity-30">
            <span className="text-[9px] text-white tracking-[0.8em] font-light uppercase">Qrify Authentication System</span>
            <span className="text-[#B08D6D] text-[12px] font-jp">和 · 静 · 清</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;