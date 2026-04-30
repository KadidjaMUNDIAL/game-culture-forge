import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AlunoArea = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-navy text-white font-display">
        Carregando...
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to="/aluno/perfil" replace />;
};

export default AlunoArea;
