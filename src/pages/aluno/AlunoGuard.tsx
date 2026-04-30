import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AlunoGuard = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[hsl(220_70%_6%)] text-white font-display">
        Carregando...
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AlunoGuard;
