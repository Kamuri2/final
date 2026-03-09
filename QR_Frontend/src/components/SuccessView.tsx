import { CheckCircle2 } from "lucide-react";

const SuccessView = () => {
  return (
    <div className="text-center space-y-6 animate-fade-in-up">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-matcha-light">
        <CheckCircle2
          className="w-8 h-8 text-matcha-vivid"
          strokeWidth={1.5}
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight text-foreground font-jp">
          ようこそ
        </h2>
        <p className="text-base text-foreground font-light">
          Validación exitosa
        </p>
        <p className="text-sm text-muted-foreground">
          Su credencial ha sido verificada correctamente.
        </p>
      </div>

      {/* Decorative line */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <div className="h-px w-12 bg-border" />
        <span className="text-xs text-muted-foreground font-jp">承認済み</span>
        <div className="h-px w-12 bg-border" />
      </div>
    </div>
  );
};

export default SuccessView;
