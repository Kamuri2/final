import { XCircle, RotateCcw } from "lucide-react";

interface ErrorViewProps {
  onRetry: () => void;
}

const ErrorView = ({ onRetry }: ErrorViewProps) => {
  return (
    <div className="text-center space-y-6 animate-fade-in-up">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta-light">
        <XCircle
          className="w-8 h-8 text-terracotta"
          strokeWidth={1.5}
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight text-foreground font-jp">
          エラー
        </h2>
        <p className="text-base text-foreground font-light">
          Credencial no válida
        </p>
        <p className="text-sm text-muted-foreground">
          La información proporcionada no pudo ser verificada. Por favor, inténtelo de nuevo.
        </p>
      </div>

      {/* Retry */}
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                   bg-secondary text-secondary-foreground
                   font-medium text-sm tracking-wide
                   hover:opacity-80 active:scale-[0.98]
                   transition-all duration-200"
      >
        <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
        <span>Intentar de nuevo</span>
      </button>
    </div>
  );
};

export default ErrorView;
