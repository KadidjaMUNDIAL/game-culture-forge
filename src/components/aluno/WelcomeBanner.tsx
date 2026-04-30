import { useAuth } from "@/contexts/AuthContext";

const MASCOT = "https://i.ibb.co/wnSV4bC/Chat-GPT-Image-26-de-abr-de-2026-10-25-49.png";

export const WelcomeBanner = () => {
  const { profile } = useAuth();
  return (
    <div className="rounded-xl p-6 bg-gradient-to-r from-[hsl(220_70%_15%)] to-[hsl(218_75%_27%)] border-2 border-pixelyellow/60 flex items-center justify-between gap-6 shadow-lg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--yellow)) 1.5px, transparent 2px), radial-gradient(white 1px, transparent 2px)",
          backgroundSize: "60px 60px, 90px 90px",
        }}
      />
      <div className="relative z-10">
        <h1 className="font-display text-3xl md:text-4xl uppercase text-pixelyellow">
          Bem-vindo(a), {profile?.nome ?? "Aluno"}!
        </h1>
        <p className="font-body text-white/85 mt-2">
          Continue sua jornada em Jogos, Cultura e Sociedade 🎮
        </p>
      </div>
      <img
        src={MASCOT}
        alt="Mascote da disciplina"
        className="w-24 md:w-36 h-auto relative z-10"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};
