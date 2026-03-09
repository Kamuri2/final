import { useEffect, useState } from "react";

interface TrainGateAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  type: "success" | "error";
}

const TrainGateAnimation = ({ isActive, onComplete, type }: TrainGateAnimationProps) => {
  const [phase, setPhase] = useState<"idle" | "closing" | "closed" | "opening">("idle");

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      return;
    }

    // Phase 1: Gates close (slide in from sides)
    setPhase("closing");

    const closedTimer = setTimeout(() => {
      setPhase("closed");
    }, 600);

    // Phase 2: Hold closed briefly
    const openTimer = setTimeout(() => {
      setPhase("opening");
    }, 1200);

    // Phase 3: Gates open, animation complete
    const completeTimer = setTimeout(() => {
      setPhase("idle");
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(closedTimer);
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, onComplete]);

  if (phase === "idle") return null;

  const isSuccess = type === "success";
  const gateColor = isSuccess ? "bg-primary" : "bg-destructive";
  const iconText = isSuccess ? "✓" : "✕";
  const statusText = isSuccess ? "承認済み" : "拒否";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Left gate */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 ${gateColor} transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] flex items-center justify-end pr-4`}
        style={{
          transform:
            phase === "closing" || phase === "closed"
              ? "translateX(0)"
              : phase === "opening"
              ? "translateX(-100%)"
              : "translateX(-100%)",
        }}
      >
        {/* Decorative stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-primary-foreground/20" />
        <div className="absolute right-3 top-0 bottom-0 w-px bg-primary-foreground/10" />
      </div>

      {/* Right gate */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 ${gateColor} transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] flex items-center justify-start pl-4`}
        style={{
          transform:
            phase === "closing" || phase === "closed"
              ? "translateX(0)"
              : phase === "opening"
              ? "translateX(100%)"
              : "translateX(100%)",
        }}
      >
        {/* Decorative stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary-foreground/20" />
        <div className="absolute left-3 top-0 bottom-0 w-px bg-primary-foreground/10" />
      </div>

      {/* Center content (visible when closed) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
        style={{
          opacity: phase === "closed" ? 1 : 0,
        }}
      >
        {/* Circle icon */}
        <div className="w-20 h-20 rounded-full border-2 border-primary-foreground/80 flex items-center justify-center mb-4">
          <span className="text-primary-foreground text-3xl font-light">{iconText}</span>
        </div>
        {/* Status text */}
        <p className="text-primary-foreground text-lg font-jp tracking-[0.3em] font-light">
          {statusText}
        </p>
        {/* Decorative line */}
        <div className="mt-6 flex items-center gap-2">
          <div className="h-px w-16 bg-primary-foreground/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
          <div className="h-px w-16 bg-primary-foreground/40" />
        </div>
      </div>
    </div>
  );
};

export default TrainGateAnimation;
