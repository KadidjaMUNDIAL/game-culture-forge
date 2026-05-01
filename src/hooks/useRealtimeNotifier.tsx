import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Conecta-se ao realtime do Supabase e dispara toasts para:
 * - Novas tarefas broadcast
 * - Novos alertas broadcast
 * - Posts próprios aprovados/reprovados
 * - Conquistas desbloqueadas
 */
export const useRealtimeNotifier = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("aluno-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks", filter: "is_broadcast=eq.true" }, (p) => {
        toast.info(`📋 Nova tarefa da Professora: ${(p.new as any).titulo}`);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts", filter: "is_broadcast=eq.true" }, (p) => {
        const a: any = p.new;
        toast.warning(`🔔 ${a.titulo}`, { description: a.mensagem });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts", filter: `author_id=eq.${user.id}` }, (p) => {
        const oldS = (p.old as any)?.status;
        const newS = (p.new as any)?.status;
        if (oldS === newS) return;
        if (newS === "publicado") toast.success(`✅ Seu post "${(p.new as any).titulo}" foi publicado!`);
        else if (newS === "reprovado") toast.error(`❌ Post "${(p.new as any).titulo}" reprovado`, { description: (p.new as any).justificativa_reprovacao });
        else if (newS === "rascunho" && oldS === "aguardando") toast.info(`✏️ Post "${(p.new as any).titulo}" voltou para revisão`);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_conquistas", filter: `user_id=eq.${user.id}` }, async (p) => {
        const { data } = await supabase.from("conquistas").select("titulo, xp_recompensa").eq("id", (p.new as any).conquista_id).maybeSingle();
        if (data) toast.success(`🏆 Conquista desbloqueada: ${data.titulo}`, { description: `+${data.xp_recompensa} XP` });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);
};
