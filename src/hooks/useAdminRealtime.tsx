import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Toasts em tempo real para o admin:
 * - Novo post aguardando aprovação
 * - Novo comentário em qualquer post
 */
export const useAdminRealtime = () => {
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (p) => {
        const n: any = p.new;
        if (n.status === "aguardando") toast.info(`📝 Novo post aguardando: ${n.titulo}`);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (p) => {
        const o: any = p.old, n: any = p.new;
        if (o.status !== "aguardando" && n.status === "aguardando") {
          toast.info(`📝 Post enviado para aprovação: ${n.titulo}`);
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_comments" }, (p) => {
        const c: any = p.new;
        toast.info(`💬 Novo comentário`, { description: (c.conteudo || "").slice(0, 80) });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);
};
