import { useState, useCallback, useEffect } from "react";
import ValidationCard from "@/components/ValidationCard";
import SuccessView from "@/components/SuccessView";
import ErrorView from "@/components/ErrorView";
import TrainGateAnimation from "@/components/TrainGateAnimation";
import QRScanner from "@/components/QRScanner";
import StudentWelcomeView, { type StudentData } from "@/components/StudentWelcomeView";
import AdminDashboardView from "@/components/AdminDashboardView";
import AcademicManagementView from "@/components/AcademicManagementView";
type AppMode = "selection" | "validator" | "admin";
type AdminSubMode = "menu" | "records" | "management";
type ViewState = "form" | "success" | "error";

const Index = () => {
  const [appMode, setAppMode] = useState<AppMode>("selection");
  const [adminSubMode, setAdminSubMode] = useState<AdminSubMode>("menu");
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
    if (!adminUser || !adminPass) return alert("Ingresa tus credenciales.");

    const GQL_LOGIN = {
      query: `mutation LoginAdmin($u: String!, $p: String!) {
        login(username: $u, password: $p) { token rol id }
      }`,
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
        if (result.data.login.rol === 'ADMIN') {
          localStorage.setItem('raven_token', result.data.login.token);
          setIsAdminAuthenticated(true);
          setAdminSubMode("menu"); // Al entrar, vamos directo al menú de opciones
        } else {
          alert("⚠️ Solo administradores pueden entrar aquí.");
        }
      }
    } catch (e) { alert("⚠️ Error de conexión."); }
  };

  // --- 🛡️ VALIDACIÓN QR (SIN CAMBIOS) ---
  const handleValidation = async (credential: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const GQL_MUTATION = {
      query: `mutation Validar($hash: String!, $pId: Int!, $vId: Int!) {
        validarAcceso(qr_hash: $hash, puntoId: $pId, verificadorId: $vId) {
          valido mensaje alumno { nombre_completo matricula carrera semestre }
        }
      }`,
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

        });
      } else { setGateType("error"); }
      setGateActive(true);
    } catch (e) { setGateType("error"); setGateActive(true); } finally { setIsSubmitting(false); }
  };

  const handleGateComplete = useCallback(() => {
    setGateActive(false);
    setView(gateType === "success" ? "success" : "error");
    setTimeout(() => { setView("form"); setStudentData(null); }, 4000);
  }, [gateType]);

  return (
    <>
      <TrainGateAnimation isActive={gateActive} type={gateType} onComplete={handleGateComplete} />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0A0A0A]">
        <div className="fixed inset-0 asanoha-pattern opacity-10 pointer-events-none justify-center items-center flex" />
        <div className="fixed inset-0 bg-gradient-to-tr from-black via-[#0f0f0f] to-[#1a1a0a] pointer-events-none" />

        <div className={`relative z-10 w-full flex flex-col items-center ${isAdminAuthenticated && adminSubMode !== "menu" ? 'max-w-7xl' : 'max-w-[600px]'}`}>

          {/* --- MODO SELECCIÓN --- */}
          {appMode === "selection" && (
            <div className="w-full animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center">
              <img src="/ICONO-WHRITE.png" className="w-80 h-80 mb-10 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl" />
              <h1 className="text-3xl font-black text-white tracking-[0.3em] mb-12 font-jp uppercase">Qrify System</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                <button onClick={() => setAppMode("validator")} className="group p-8 border border-[#B08D6D]/20 bg-black/40 backdrop-blur-xl rounded-3xl hover:border-[#B08D6D] hover:scale-105 transition-all">
                  <h2 className="text-lg font-bold text-white tracking-widest uppercase">Validación</h2>
                </button>
                <button onClick={() => setAppMode("admin")} className="group p-8 border border-[#B08D6D]/20 bg-black/40 backdrop-blur-xl rounded-3xl hover:border-[#B08D6D] hover:scale-105 transition-all">
                  <h2 className="text-lg font-bold text-white tracking-widest uppercase">Admin</h2>
                </button>
              </div>
            </div>
          )}

          {/* --- MODO VALIDADOR --- */}
          {appMode === "validator" && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="w-full flex justify-start mb-6">
                <button onClick={() => setAppMode("selection")} className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2">
                  <span className="text-lg">←</span> VOLVER AL INICIO
                </button>
              </div>
              <div className="mb-6 relative">
                <div className="absolute -inset-4 bg-[#B08D6D] rounded-full blur-2xl opacity-20 animate-pulse" />
                <img src="/ICONO.png" className="relative w-64 h-64 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl" />
              </div>
              <ValidationCard className="w-full border-[#B08D6D]/20 bg-black/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
                {view === "form" && <div className="p-2"><div className="rounded-2xl overflow-hidden"><QRScanner onResult={handleValidation} /></div></div>}
                {view === "success" && studentData && <StudentWelcomeView student={studentData} />}
                {view === "error" && <ErrorView onRetry={() => setView("form")} />}
              </ValidationCard>
            </div>
          )}

          {/* --- MODO ADMIN --- */}
          {appMode === "admin" && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="w-full flex justify-start mb-6">
                <button
                  onClick={() => {
                    if (adminSubMode === "menu") { setAppMode("selection"); setIsAdminAuthenticated(false); }
                    else { setAdminSubMode("menu"); }
                  }}
                  className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2"
                >
                  <span className="text-lg">←</span> {adminSubMode === "menu" ? "SALIR" : "VOLVER AL MENÚ"}
                </button>
              </div>

              {!isAdminAuthenticated ? (
                /* LOGIN FORM */
                <div className="w-full flex flex-col items-center">
                  <div className="mb-6 relative">
                    <div className="absolute -inset-4 bg-[#B08D6D] rounded-full blur-2xl opacity-20 animate-pulse" />
                    <img src="/ICONO.png" className="relative w-64 h-64 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl" />
                  </div>

                  <h2 className="text-3xl font-black text-white tracking-[0.2em] mb-8 uppercase font-jp">Admin Login</h2>
                  <ValidationCard className="p-10 w-full border-[#B08D6D]/20 bg-black/60 backdrop-blur-2xl rounded-3xl">
                    <div className="space-y-4">
                      <input type="text" placeholder="USUARIO" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="w-full bg-white1 border border-white/10 p-4 rounded-xl text-black font-black outline-none focus:border-[#B08D6D]" />
                      <input type="password" placeholder="CONTRASEÑA" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full bg-white1 border  border-white/10 p-4 rounded-xl text-black font-black outline-none focus:border-[#B08D6D]" />
                      <button onClick={handleAdminLogin} className="w-full bg-[#B08D6D] text-black font-black p-4 rounded-xl tracking-[0.2em] text-xs">INGRESAR</button>
                    </div>
                  </ValidationCard>
                </div>
              ) : (
                <>
                  {/* SELECTOR DE SUB-MODO */}
                  {adminSubMode === "menu" && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
                      <button onClick={() => setAdminSubMode("records")} className="group p-12 border border-[#B08D6D]/20 bg-black/40 rounded-[2.5rem] hover:border-[#B08D6D] transition-all">
                        <div className="text-5xl mb-4"></div>
                        <h3 className="text-xl font-bold text-white tracking-widest">BITÁCORA</h3>
                        <p className="text-[10px] text-white/40 mt-2 uppercase">Accesos Diarios</p>
                      </button>
                      <button onClick={() => setAdminSubMode("management")} className="group p-12 border border-[#B08D6D]/20 bg-black/40 rounded-[2.5rem] hover:border-[#B08D6D] transition-all">
                        <div className="text-5xl mb-4"></div>
                        <h3 className="text-xl font-bold text-white tracking-widest">GESTIÓN</h3>
                        <p className="text-[10px] text-white/40 mt-2 uppercase">Carreras y Grupos</p>
                      </button>
                    </div>
                  )}

                  {/* VISTAS ESPECÍFICAS */}
                  {adminSubMode === "records" && <AdminDashboardView />}
                  {adminSubMode === "management" && <AcademicManagementView />}
                </>
              )}
            </div>
          )}

          <div className="mt-12 flex flex-col items-center gap-2 opacity-30">
            <span className="text-[9px] text-white tracking-[0.8em] font-light uppercase">Qrify Authentication System</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;