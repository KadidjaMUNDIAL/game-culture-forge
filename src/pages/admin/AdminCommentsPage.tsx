import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Row = {
  id: string; conteudo: string; created_at: string;
  author_id: string | null; author_nome: string | null;
  post_id: string;
  post?: { titulo: string };
  _displayNome?: string;
};

const AdminCommentsPage = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("post_comments")
      .select("*, post:posts(titulo)")
      .order("created_at", { ascending: false })
      .limit(200);
    const items = (data as any[]) || [];
    const ids = [...new Set(items.filter(c => c.author_id).map(c => c.author_id))];
    let map: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", ids);
      map = Object.fromEntries((profs || []).map((p: any) => [p.id, p.nome]));
    }
    setList(items.map(c => ({ ...c, _displayNome: c.author_nome || map[c.author_id!] || "Visitante" })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  const remove = async (id: string) => {
    if (!confirm("Excluir comentário?")) return;
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    load();
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl uppercase text-navy flex items-center gap-2">
        <MessageSquare className="w-7 h-7"/> Comentários
      </h1>
      <p className="text-muted-foreground text-sm mt-1">Modere todos os comentários do blog ({list.length}).</p>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-muted-foreground text-sm">Carregando…</p>}
        {!loading && list.length === 0 && <p className="text-muted-foreground text-sm">Nenhum comentário.</p>}
        {list.map(c => (
          <div key={c.id} className="bg-card border-2 border-navy/10 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <div>
                <strong className="text-navy">{c._displayNome}</strong>
                <span className="text-muted-foreground"> · {format(new Date(c.created_at), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="flex gap-2">
                <Link to={`/blog/${c.post_id}`} target="_blank" className="text-xs text-navy underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3"/>{c.post?.titulo || "post"}
                </Link>
                <Button size="icon" variant="ghost" onClick={() => remove(c.id)} className="h-6 w-6">
                  <Trash2 className="w-3 h-3 text-destructive"/>
                </Button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{c.conteudo}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCommentsPage;
