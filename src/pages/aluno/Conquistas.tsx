import { useEffect, useState } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Lock, Star, BookOpen, Sparkles, CheckCircle2, Target, PenTool, TrendingUp, Crown, LogIn, Pen, Award } from "lucide-react";
import { format } from "date-fns";

type Conquista = { id: string; codigo: string; titulo: string; descricao: string; icone: string; xp_recompensa: number };
type UserConq = { conquista_id: string; unlocked_at: string };

const ICONS: Record<string, any> = {
  trophy: Trophy, sparkles: Sparkles, "check-circle": CheckCircle2, check: CheckCircle2,
  target: Target, "pen-tool": PenTool, pen: Pen, "trending-up": TrendingUp, crown: Crown,
  "log-in": LogIn, book: BookOpen, "book-open": BookOpen, star: Star, award: Award,
};

const Conquistas = () => {
  const { user } = useAuth();
  const [list, setList] = useState<Conquista[]>([]);
  const [unlocked, setUnlocked] = useState<UserConq[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("conquistas").select("*").order("xp_recompensa"),
      supabase.from("user_conquistas").select("*").eq("user_id", user.id),
    ]).then(([{ data: c }, { data: u }]) => {
      setList((c as any) || []);
      setUnlocked((u as any) || []);
    });
  }, [user]);

  const unlockedMap = Object.fromEntries(unlocked.map(u => [u.conquista_id, u.unlocked_at]));
  const totalXp = list.filter(c => unlockedMap[c.id]).reduce((s, c) => s + c.xp_recompensa, 0);
  const pct = list.length ? Math.round((unlocked.length / list.length) * 100) : 0;

  return (
    <AlunoLayout>
      <h1 className="font-display text-4xl uppercase text-pixelyellow flex items-center gap-3">
        <Trophy className="w-9 h-9" /> Conquistas
      </h1>
      <p className="font-body text-white/80 mt-1">Desbloqueie marcos pela jornada na disciplina.</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <div className="bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/40 rounded-xl p-4">
          <p className="text-xs uppercase text-white/70">Desbloqueadas</p>
          <p className="font-display text-3xl text-pixelyellow">{unlocked.length}/{list.length}</p>
          <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-pixelyellow transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/40 rounded-xl p-4">
          <p className="text-xs uppercase text-white/70">XP de conquistas</p>
          <p className="font-display text-3xl text-pixelyellow flex items-center gap-2"><Star className="w-6 h-6"/>{totalXp}</p>
        </div>
        <div className="bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/40 rounded-xl p-4">
          <p className="text-xs uppercase text-white/70">Progresso</p>
          <p className="font-display text-3xl text-pixelyellow">{pct}%</p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(c => {
          const got = !!unlockedMap[c.id];
          const Icon = ICONS[c.icone] || Trophy;
          return (
            <div key={c.id} className={`rounded-xl p-4 border-2 transition-all flex gap-3 ${
              got
                ? "bg-gradient-to-br from-pixelyellow/20 to-pixelyellow/5 border-pixelyellow shadow-[0_0_18px_hsl(var(--yellow)/0.35)]"
                : "bg-white/5 border-white/10 opacity-70"
            }`}>
              <div className={`shrink-0 w-14 h-14 rounded-lg grid place-items-center ${got ? "bg-pixelyellow/30" : "bg-white/5"}`}>
                {got ? <Icon className="w-7 h-7 text-pixelyellow" /> : <Lock className="w-6 h-6 text-white/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg uppercase text-pixelyellow leading-tight">{c.titulo}</h3>
                <p className="text-xs text-white/70 mt-0.5">{c.descricao}</p>
                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="text-pixelyellow font-bold">+{c.xp_recompensa} XP</span>
                  {got && <span className="text-white/60">{format(new Date(unlockedMap[c.id]), "dd/MM/yyyy")}</span>}
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-white/60 col-span-full text-center py-12">Nenhuma conquista cadastrada.</p>}
      </div>
    </AlunoLayout>
  );
};

export default Conquistas;
