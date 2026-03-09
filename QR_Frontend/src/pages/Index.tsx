import { useState, useCallback } from "react";
import ValidationCard from "@/components/ValidationCard";
import CredentialForm from "@/components/CredentialForm";
import SuccessView from "@/components/SuccessView";
import ErrorView from "@/components/ErrorView";
import TrainGateAnimation from "@/components/TrainGateAnimation";
import StudentWelcomeView, { type StudentData, MOCK_STUDENT } from "@/components/StudentWelcomeView";

type ViewState = "form" | "success" | "error";

const Index = () => {
  const [view, setView] = useState<ViewState>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gateActive, setGateActive] = useState(false);
  const [gateType, setGateType] = useState<"success" | "error">("success");
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  const handleValidation = async (credential: string) => {
    setIsSubmitting(true);

    try {
      // ============================================
      // AQUÍ SE CONECTARÁ EL BACKEND
      // Reemplazar esta simulación con una petición real:
      // const response = await fetch('/api/validate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ credential }),
      // });
      // const data = await response.json();
      // if (data.valid) { setGateType("success"); }
      // else { setGateType("error"); }
      // setGateActive(true);
      // ============================================

      // Simulación: espera 1.5s, "admin123" es válido
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (credential === "admin123") {
        setGateType("success");
        // ============================================
        // AQUÍ ASIGNAR DATOS REALES DEL ESTUDIANTE
        // const studentResponse = await fetch(`/api/student/${credential}`);
        // const studentJson = await studentResponse.json();
        // setStudentData(studentJson);
        // ============================================
        setStudentData(MOCK_STUDENT); // SIMULACIÓN - REEMPLAZAR
      } else {
        setGateType("error");
        setStudentData(null);
      }
      setGateActive(true);
    } catch {
      setGateType("error");
      setGateActive(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGateComplete = useCallback(() => {
    setGateActive(false);
    // Show result briefly, then return to form
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
      <TrainGateAnimation
        isActive={gateActive}
        type={gateType}
        onComplete={handleGateComplete}
      />
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Asanoha background pattern */}
        <div className="fixed inset-0 asanoha-pattern pointer-events-none" />

        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-accent/30 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-md">
          {/* Brand mark */}
          <div className="text-center mb-8 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-light">
              Sistema de Validación
            </p>
          </div>

          {/* Main card */}
          <ValidationCard>
            {view === "form" && (
              <CredentialForm
                onSubmit={handleValidation}
                isSubmitting={isSubmitting}
              />
            )}
            {view === "success" && studentData && <StudentWelcomeView student={studentData} />}
            {view === "error" && <ErrorView onRetry={handleRetry} />}
          </ValidationCard>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-[11px] text-muted-foreground/60 font-light tracking-wide">
              和 · 静 · 清
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
