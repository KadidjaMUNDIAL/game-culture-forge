import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, MessageSquare } from "lucide-react";

type Comment = {
  id: string; conteudo: string; created_at: string;
  author_id: string | null; author_nome: string | null;
  _displayNome?: string;
};

export const Comentarios = ({ postId }: { postId: string }) => {
  const { user, isAdmin } = useAuth();
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [nome, setNome] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("post_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    const items = (data as any[]) || [];
    const ids = [...new Set(items.filter(c => c.author_id).map(c => c.author_id))];
    let map: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", ids);
      map = Object.fromEntries((profs || []).map((p: any) => [p.id, p.nome]));
    }
    setList(items.map(c => ({ ...c, _displayNome: c.author_nome || map[c.author_id] || "Visitante" })));
  };
  useEffect(() => { load(); }, [postId]);

  const send = async () => {
    if (!text.trim()) return;
    if (!user && !nome.trim()) return toast.error("Informe seu nome");
    setSending(true);
    const payload: any = {
      post_id: postId,
      conteudo: text.trim(),
      author_id: user?.id ?? null,
      author_nome: user ? null : nome.trim(),
    };
    const { error } = await supabase.from("post_comments").insert(payload);
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir comentário?")) return;
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <section className="mt-10 border-t-2 border-pixelyellow/30 pt-6">
      <h3 className="font-display text-2xl uppercase text-navy flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-pixelyellow" /> Comentários ({list.length})
      </h3>

      <div className="mt-4 space-y-2">
        {!user && (
          <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" maxLength={60} />
        )}
        <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Deixe seu comentário..." rows={3} />
        <Button onClick={send} disabled={sending || !text.trim()} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
          Comentar
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 && <p className="text-muted-foreground text-sm">Seja o primeiro a comentar.</p>}
        {list.map(c => (
          <div key={c.id} className="bg-muted/50 rounded-lg p-3 border border-pixelyellow/20">
            <div className="flex items-center justify-between text-xs mb-1">
              <strong className="text-navy">{c._displayNome}</strong>
              <span className="text-muted-foreground">{format(new Date(c.created_at), "dd/MM/yyyy HH:mm")}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{c.conteudo}</p>
            {((user?.id && c.author_id && user.id === c.author_id) || isAdmin) && (
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)} className="h-6 w-6 mt-1">
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
