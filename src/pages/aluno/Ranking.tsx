import { useEffect, useState } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Crown, Medal, Star } from "lucide-react";

type RankingRow = { id: string; nome: string; classe: string; xp: number; nivel: number; avatar_url: string | null };

const Ranking = () => {
  const { user } = useAuth();
  const [list, setList] = useState<RankingRow[]>([]);

  useEffect(() => {
    supabase.from("ranking_alunos").select("*").limit(50).then(({ data }) => {
      setList((data as any) || []);
    });
  }, []);

  const podio = list.slice(0, 3);
  const resto = list.slice(3);

  const podioMap = [
    { i: 1, color: "text-pixelyellow", bg: "from-pixelyellow/40 to-pixelyellow/10", icon: Crown, h: "h-32", label: "1º" },
    { i: 0, color: "text-gray-300", bg: "from-gray-300/40 to-gray-300/10", icon: Medal, h: "h-24", label: "2º" },
    { i: 2, color: "text-orange-400", bg: "from-orange-400/40 to-orange-400/10", icon: Medal, h: "h-20", label: "3º" },
  ];

  return (
    <AlunoLayout>
      <h1 className="font-display text-4xl uppercase text-pixelyellow flex items-center gap-3">
        <Trophy className="w-9 h-9" /> Ranking
      </h1>
      <p className="font-body text-white/80 mt-1">Os 50 alunos com mais XP da turma.</p>

      {/* Pódio */}
      {podio.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3 items-end max-w-2xl mx-auto">
          {podioMap.map((slot, idx) => {
            const aluno = podio[slot.i];
            if (!aluno) return <div key={idx} />;
            const Ic = slot.icon;
            const isMe = aluno.id === user?.id;
            return (
              <div key={aluno.id} className="flex flex-col items-center gap-2 animate-fade-in">
                {aluno.avatar_url ? (
                  <img src={aluno.avatar_url} alt="" className={`w-16 h-16 rounded-full object-cover border-4 ${slot.i === 1 ? "border-pixelyellow shadow-[0_0_20px_hsl(var(--yellow))]" : "border-white/40"}`} />
                ) : (
                  <div className={`w-16 h-16 rounded-full bg-pixelyellow/20 grid place-items-center font-display text-2xl text-pixelyellow border-4 ${slot.i === 1 ? "border-pixelyellow shadow-[0_0_20px_hsl(var(--yellow))]" : "border-white/40"}`}>
                    {aluno.nome[0]?.toUpperCase()}
                  </div>
                )}
                <div className={`w-full ${slot.h} bg-gradient-to-t ${slot.bg} border-2 border-pixelyellow/40 rounded-t-xl flex flex-col items-center justify-end p-2`}>
                  <Ic className={`w-7 h-7 ${slot.color} mb-1`} />
                  <p className="font-display text-2xl text-white">{slot.label}</p>
                </div>
                <div className={`text-center ${isMe ? "ring-2 ring-pixelyellow rounded px-2 py-1 -mt-1" : ""}`}>
                  <p className="font-display text-sm text-pixelyellow uppercase truncate max-w-[120px]">{aluno.nome}</p>
                  <p className="text-xs text-white/70">Nv.{aluno.nivel} • {aluno.xp}xp</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista */}
      <div className="mt-8 space-y-2 max-w-3xl mx-auto">
        {resto.map((a, i) => {
          const isMe = a.id === user?.id;
          return (
            <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isMe ? "bg-pixelyellow/20 border-2 border-pixelyellow shadow-[0_0_12px_hsl(var(--yellow)/0.4)]" : "bg-[hsl(220_60%_12%)] border border-pixelyellow/20 hover:border-pixelyellow/50"}`}>
              <span className="font-display text-xl text-pixelyellow w-8 text-center">{i + 4}</span>
              {a.avatar_url ? (
                <img src={a.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-pixelyellow/20 grid place-items-center font-display text-pixelyellow">
                  {a.nome[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-white uppercase text-sm truncate">{a.nome} {isMe && <span className="text-pixelyellow text-xs">(você)</span>}</p>
                <p className="text-xs text-white/60">{a.classe}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-pixelyellow flex items-center gap-1 justify-end"><Star className="w-3.5 h-3.5" />{a.xp}</p>
                <p className="text-[10px] text-white/60">Nível {a.nivel}</p>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-center text-white/60 py-12">Nenhum aluno com XP ainda.</p>}
      </div>
    </AlunoLayout>
  );
};

export default Ranking;
