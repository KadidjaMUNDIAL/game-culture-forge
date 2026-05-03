import { useEffect, useState } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trophy, Star, Award, Lock } from "lucide-react";

type Profile = { id: string; nome: string; classe: string; bio: string | null; avatar_url: string | null; xp: number; nivel: number };
type Conquista = { id: string; codigo: string; titulo: string; descricao: string; icone: string; xp_recompensa: number };
type UserConq = { conquista_id: string; unlocked_at: string };

const MeuPerfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nome: "", classe: "", bio: "" });
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [unlocked, setUnlocked] = useState<UserConq[]>([]);
  const [stats, setStats] = useState({ tarefas: 0, posts: 0 });

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: c }, { data: u }, { count: tc }, { count: pc }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("conquistas").select("*").order("xp_recompensa"),
      supabase.from("user_conquistas").select("*").eq("user_id", user.id),
      supabase.from("task_completions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("status", "publicado"),
    ]);
    if (p) {
      setProfile(p as any);
      setForm({ nome: (p as any).nome, classe: (p as any).classe, bio: (p as any).bio || "" });
    }
    setConquistas((c as any) || []);
    setUnlocked((u as any) || []);
    setStats({ tarefas: tc ?? 0, posts: pc ?? 0 });
  };
  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      nome: form.nome.trim(), bio: form.bio.trim() || null,
    }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
    setEditing(false);
    load();
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    toast.success("Avatar atualizado!");
    load();
  };

  if (!profile) {
    return <AlunoLayout><p className="text-white/60">Carregando perfil...</p></AlunoLayout>;
  }

  const xpProx = profile.nivel * 100;
  const xpAtual = profile.xp - (profile.nivel - 1) * 100;
  const progresso = Math.min(100, (xpAtual / 100) * 100);
  const unlockedIds = new Set(unlocked.map(u => u.conquista_id));

  return (
    <AlunoLayout>
      {/* Banner perfil */}
      <div className="rounded-xl p-6 bg-gradient-to-r from-[hsl(220_70%_15%)] to-[hsl(218_75%_27%)] border-2 border-pixelyellow/60 flex items-center gap-6 shadow-lg">
        <label className="cursor-pointer relative shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-pixelyellow" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-pixelyellow/20 grid place-items-center font-display text-3xl text-pixelyellow border-4 border-pixelyellow">
              {profile.nome[0]?.toUpperCase()}
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          <span className="absolute bottom-0 right-0 bg-pixelyellow text-navy text-[9px] px-1.5 py-0.5 rounded font-bold">EDITAR</span>
        </label>
        <div className="flex-1">
          <h1 className="font-display text-3xl uppercase text-pixelyellow">{profile.nome}</h1>
          <p className="text-white/80 text-sm">{profile.classe}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="bg-pixelyellow text-navy px-3 py-1 rounded-full font-display text-sm font-bold">NÍVEL {profile.nivel}</span>
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-pixelyellow transition-all" style={{ width: `${progresso}%` }} />
              </div>
              <p className="text-[10px] text-white/70 mt-1">{xpAtual}/100 XP até nível {profile.nivel + 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editar perfil */}
      <div className="mt-6 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl uppercase text-pixelyellow">Dados da Conta</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "Cancelar" : "Editar"}
          </Button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div><label className="text-sm">Nome</label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div><label className="text-sm">Classe</label><Input value={form.classe} disabled className="opacity-70 cursor-not-allowed" /><p className="text-[10px] text-white/50 mt-1">A classe não pode ser alterada pelo aluno.</p></div>
            <div><label className="text-sm">Bio</label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            <Button onClick={save} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">Salvar</Button>
          </div>
        ) : (
          <div className="space-y-1 text-sm text-white/85">
            <p><strong className="text-pixelyellow">Nome:</strong> {profile.nome}</p>
            <p><strong className="text-pixelyellow">Classe:</strong> {profile.classe}</p>
            <p><strong className="text-pixelyellow">Bio:</strong> {profile.bio || <em className="text-white/50">Sem bio</em>}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <StatBox icon={Star} label="XP Total" value={profile.xp} />
        <StatBox icon={Trophy} label="Conquistas" value={`${unlocked.length}/${conquistas.length}`} />
        <StatBox icon={Award} label="Tarefas Concluídas" value={stats.tarefas} />
        <StatBox icon={Award} label="Posts Publicados" value={stats.posts} />
      </div>

      {/* Conquistas */}
      <div className="mt-6 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 rounded-xl p-5">
        <h2 className="font-display text-xl uppercase text-pixelyellow mb-4">Inventário de Conquistas</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {conquistas.map(c => {
            const got = unlockedIds.has(c.id);
            return (
              <div key={c.id} title={`${c.titulo}: ${c.descricao}`}
                className={`aspect-square grid place-items-center rounded-lg p-2 text-center border-2 transition-all ${
                  got ? "bg-pixelyellow/15 border-pixelyellow shadow-[0_0_12px_hsl(var(--yellow)/0.4)]" : "bg-white/5 border-white/10 grayscale opacity-50"
                }`}>
                {got ? <Trophy className="w-7 h-7 text-pixelyellow" /> : <Lock className="w-7 h-7 text-white/40" />}
                <p className="text-[10px] text-white/80 mt-1 leading-tight">{c.titulo}</p>
                <p className="text-[9px] text-pixelyellow">+{c.xp_recompensa}xp</p>
              </div>
            );
          })}
        </div>
      </div>
    </AlunoLayout>
  );
};

const StatBox = ({ icon: Icon, label, value }: { icon: any; label: string; value: any }) => (
  <div className="bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 rounded-xl p-4">
    <Icon className="w-5 h-5 text-pixelyellow mb-1" />
    <p className="text-xs text-white/70 uppercase">{label}</p>
    <p className="font-display text-2xl text-pixelyellow">{value}</p>
  </div>
);

export default MeuPerfil;
