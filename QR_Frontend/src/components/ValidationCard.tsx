import { ReactNode } from "react";

interface ValidationCardProps {
  children: ReactNode;
  className?: string;
}

const ValidationCard = ({ children }: ValidationCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-8 sm:p-10 w-full max-w-md animate-scale-in">
      {children}
    </div>
  );
};

export default ValidationCard;
