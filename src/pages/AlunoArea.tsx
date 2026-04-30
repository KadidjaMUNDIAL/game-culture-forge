import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, User, Calendar, BookOpen, FileText, MessageSquare } from "lucide-react";

const items = [
  { icon: Home, label: "INÍCIO" },
  { icon: User, label: "MEU PERFIL" },
  { icon: Calendar, label: "AGENDA" },
  { icon: BookOpen, label: "APOSTILA" },
  { icon: FileText, label: "MATERIAIS EXTRAS" },
  { icon: MessageSquare, label: "BLOG" },
];

const MASCOT = "https://i.ibb.co/wnSV4bC/Chat-GPT-Image-26-de-abr-de-2026-10-25-49.png";

const AlunoArea = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <div className="min-h-screen grid place-items-center bg-navy text-white font-display">Carregando...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen flex bg-[hsl(220_70%_6%)] text-white">
      {/* Sidebar */}
      <aside className="w-60 bg-gradient-to-b from-[hsl(220_70%_8%)] to-[hsl(220_70%_4%)] border-r border-pixelyellow/20 flex flex-col p-4">
        <h2 className="font-display text-xl text-pixelyellow text-center uppercase">Área do Aluno</h2>
        <p className="text-center text-white/80 text-sm font-ui mt-1">Estudante: {profile?.nome ?? "Aluno"}</p>
        <div className="h-0.5 bg-pixelyellow my-3" />
        <nav className="flex-1 flex flex-col gap-1">
          {items.map((it, i) => (
            <button
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-ui text-sm ${i === 1 ? "bg-pixelyellow text-navy font-semibold" : "text-white/80 hover:bg-white/10"}`}
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </button>
          ))}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md font-ui text-sm text-white/80 hover:bg-pixelred/30 mt-auto"
          >
            <LogOut className="w-4 h-4" />
            SAIR
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="rounded-xl p-6 bg-gradient-to-r from-[hsl(220_70%_15%)] to-[hsl(218_75%_27%)] border-2 border-pixelyellow/60 flex items-center justify-between gap-6 shadow-lg">
          <div>
            <h1 className="font-display text-3xl md:text-4xl uppercase text-pixelyellow">
              Bem-vindo(a), {profile?.nome ?? "Aluno"}!
            </h1>
            <p className="font-body text-white/85 mt-2">
              Continue sua jornada em Jogos, Cultura e Sociedade 🎮
            </p>
          </div>
          <img src={MASCOT} alt="Mascote" className="w-24 md:w-36 h-auto" style={{ imageRendering: "pixelated" }} />
        </div>

        <div className="mt-8 pixel-card !bg-[hsl(220_60%_12%)] !text-white !border-pixelyellow/50">
          <h2 className="font-display text-2xl uppercase text-pixelyellow mb-2">Em breve</h2>
          <p className="font-body text-white/80">
            Perfil, Agenda, Apostila, Materiais Extras, Blog do Aluno e Sistema de Gamificação completos serão implementados nas próximas etapas.
          </p>
          <Button onClick={signOut} variant="outline" className="mt-4">Sair</Button>
        </div>
      </main>
    </div>
  );
};

export default AlunoArea;
