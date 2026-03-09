import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { isAuthenticated, rol } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && rol !== requiredRole) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
