import { useState } from "react";
import { KeyRound, ArrowRight, Loader2 } from "lucide-react";

interface CredentialFormProps {
  onSubmit: (credential: string) => void;
  isSubmitting: boolean;
}

const CredentialForm = ({ onSubmit, isSubmitting }: CredentialFormProps) => {
  const [credential, setCredential] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credential.trim()) {
      onSubmit(credential.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-2">
          <KeyRound className="w-6 h-6 text-accent-foreground" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground font-jp">
          認証
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          Ingrese su credencial para continuar
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <label
          htmlFor="credential"
          className="text-xs font-medium text-muted-foreground uppercase tracking-widest"
        >
          Credencial
        </label>
        <input
          id="credential"
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          placeholder="Ingrese su código de acceso"
          disabled={isSubmitting}
          className="w-full px-4 py-3.5 rounded-xl bg-background border border-border
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40
                     transition-all duration-300 text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
        />
      </div>

      {/* Button */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <button
          type="submit"
          disabled={isSubmitting || !credential.trim()}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5
                     rounded-xl bg-primary text-primary-foreground
                     font-medium text-sm tracking-wide
                     hover:opacity-90 active:scale-[0.98]
                     transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                     shadow-soft"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Validando...</span>
            </>
          ) : (
            <>
              <span>Validar</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CredentialForm;
