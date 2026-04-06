import { useState, useCallback } from "react";
import ValidationCard from "@/components/ValidationCard";
import SuccessView from "@/components/SuccessView";
import ErrorView from "@/components/ErrorView";
import TrainGateAnimation from "@/components/TrainGateAnimation";
import QRScanner from "@/components/QRScanner";
import StudentWelcomeView, { type StudentData } from "@/components/StudentWelcomeView";

type ViewState = "form" | "success" | "error";

const Index = () => {
  const [view, setView] = useState<ViewState>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gateActive, setGateActive] = useState(false);
  const [gateType, setGateType] = useState<"success" | "error">("success");
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  const handleValidation = async (credential: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const GQL_MUTATION = {
      query: `
        mutation Validar($hash: String!, $pId: Int!, $vId: Int!) {
          validarAcceso(qr_hash: $hash, puntoId: $pId, verificadorId: $vId) {
            valido
            mensaje
            alumno {
              nombre_completo
              matricula
              carrera
              semestre
            }
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
      if (result.errors) throw new Error(result.errors[0].message);

      const res = result.data.validarAcceso;

      if (res.valido && res.alumno) {
        setGateType("success");
        setStudentData({
          nombre: res.alumno.nombre_completo,
          matricula: res.alumno.matricula,
          carrera: res.alumno.carrera,
          semestre: res.alumno.semestre,
          activo: true,
          turno: "Matutino",
          fechaIngreso: "2024"
        });
      } else {
        setGateType("error");
        //alert(`❌ Acceso Denegado: ${res.mensaje}`);
      }
      setGateActive(true);
    } catch (error: any) {
      alert("⚠️ ERROR: " + error.message);
      setGateType("error");
      setGateActive(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGateComplete = useCallback(() => {
    setGateActive(false);
    const resultType = gateType;
    setView(resultType === "success" ? "success" : "error");

    setTimeout(() => {
      setView("form");
      setStudentData(null);
    }, 4000);
  }, [gateType]);

  const handleRetry = () => {
    setView("form");
  };

  return (
    <>
      <TrainGateAnimation isActive={gateActive} type={gateType} onComplete={handleGateComplete} />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0A0A0A]">
        <div className="fixed inset-0 asanoha-pattern opacity-10 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-tr from-black via-[#0f0f0f] to-[#1a1a0a] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center">

          {/* Logo Estilizado */}
          <div className="mb-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#B08D6D] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <img
                src="./public/ICONO.png" // 👈 Ruta corregida (asumiendo que está en public/)
                alt="RavenID Logo"
                className="relative w-70 h-70 rounded-full border-2 border-[#B08D6D]/30 shadow-2xl"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white tracking-[0.2em] mb-2 font-jp uppercase">
              Bienvenido
            </h1>
            <div className="h-[2px] w-24 bg-[#B08D6D] mx-auto mb-4 opacity-60" />
            <p className="text-[#B08D6D] text-xs font-bold tracking-[0.3em] uppercase opacity-80 text-center">
              Coloque su código frente a la cámara
            </p>
          </div>

          <ValidationCard className="w-full border-[#B08D6D]/20 bg-black/60 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden">
            {view === "form" && (
              <div className="p-2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#B08D6D]/0 via-[#B08D6D]/40 to-[#B08D6D]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

                  <div className="relative rounded-2xl overflow-hidden border border-white/5">
                    <QRScanner onResult={(hash) => handleValidation(hash)} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSubmitting ? 'bg-amber-500 animate-ping' : 'bg-[#B08D6D] animate-pulse'}`} />
                    <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">
                      {isSubmitting ? "Verificando..." : "Listo para Escanear"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {view === "success" && studentData && <StudentWelcomeView student={studentData} />}
            {view === "error" && <ErrorView onRetry={handleRetry} />}
          </ValidationCard>

          <div className="mt-12 flex flex-col items-center gap-2 opacity-30">
            <span className="text-[9px] text-white tracking-[0.8em] font-light uppercase">
              RavenID Authentication System
            </span>
            <span className="text-[#B08D6D] text-[12px] font-jp">和 · 静 · 清</span>
          </div>
        </div>
      </div>
    </>
  );
}; // 👈 Esta llave era la que faltaba y causaba el error en la línea 123

export default Index;