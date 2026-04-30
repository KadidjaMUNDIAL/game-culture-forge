import { useEffect, useState } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Send, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

type PostStatus = "rascunho" | "aguardando" | "publicado" | "reprovado";
type Post = {
  id: string; titulo: string; resumo: string | null; conteudo: string;
  capa_url: string | null; tags: string[]; status: PostStatus;
  justificativa_reprovacao: string | null; visualizacoes: number;
  published_at: string | null; created_at: string;
};

const STATUS_COLORS: Record<PostStatus, string> = {
  rascunho: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  aguardando: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  publicado: "bg-green-500/20 text-green-300 border-green-500/40",
  reprovado: "bg-red-500/20 text-red-300 border-red-500/40",
};
const STATUS_LABEL: Record<PostStatus, string> = {
  rascunho: "Rascunho", aguardando: "Aguardando", publicado: "Publicado", reprovado: "Reprovado",
};

const BlogAluno = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", resumo: "", conteudo: "", capa_url: "", tags: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("posts").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    setPosts((data as any) || []);
  };
  useEffect(() => { load(); }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ titulo: "", resumo: "", conteudo: "", capa_url: "", tags: "" });
    setOpen(true);
  };
  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({ titulo: p.titulo, resumo: p.resumo || "", conteudo: p.conteudo, capa_url: p.capa_url || "", tags: p.tags.join(", ") });
    setOpen(true);
  };

  const save = async (sendForApproval: boolean) => {
    if (!user || !form.titulo.trim()) return toast.error("Título é obrigatório");
    const payload = {
      author_id: user.id,
      titulo: form.titulo.trim(),
      resumo: form.resumo.trim() || null,
      conteudo: form.conteudo,
      capa_url: form.capa_url.trim() || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: (sendForApproval ? "aguardando" : "rascunho") as PostStatus,
    };
    if (editing) {
      const { error } = await supabase.from("posts").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("posts").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success(sendForApproval ? "Enviado para aprovação!" : "Salvo como rascunho");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Post excluído");
    load();
  };

  const sendForApproval = async (id: string) => {
    const { error } = await supabase.from("posts").update({ status: "aguardando" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Enviado para aprovação");
    load();
  };

  return (
    <AlunoLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl uppercase text-pixelyellow">Blog do Aluno</h1>
          <p className="font-body text-white/80 mt-1">Crie publicações e acompanhe o status.</p>
        </div>
        <Button onClick={openNew} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90 font-display uppercase">
          <Plus className="w-4 h-4 mr-1" /> Criar Post
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {posts.length === 0 && (
          <p className="text-white/60 col-span-full text-center py-10">Você ainda não criou nenhum post.</p>
        )}
        {posts.map(p => (
          <div key={p.id} className="rounded-xl bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 p-4 flex flex-col gap-2">
            {p.capa_url && <img src={p.capa_url} className="w-full h-32 object-cover rounded" alt="" />}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg text-pixelyellow uppercase leading-tight">{p.titulo}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap font-bold ${STATUS_COLORS[p.status]}`}>{STATUS_LABEL[p.status]}</span>
            </div>
            {p.resumo && <p className="text-sm text-white/70 line-clamp-2">{p.resumo}</p>}
            {p.status === "reprovado" && p.justificativa_reprovacao && (
              <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded border border-red-500/30">
                <strong>Reprovado:</strong> {p.justificativa_reprovacao}
              </p>
            )}
            <p className="text-[11px] text-white/50">{format(new Date(p.created_at), "dd/MM/yyyy")} • {p.visualizacoes} views</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="h-7 text-xs"><Pencil className="w-3 h-3 mr-1"/>Editar</Button>
              {(p.status === "rascunho" || p.status === "reprovado") && (
                <Button size="sm" onClick={() => sendForApproval(p.id)} className="h-7 text-xs bg-blue-500 hover:bg-blue-600">
                  <Send className="w-3 h-3 mr-1"/>Enviar
                </Button>
              )}
              {p.status === "publicado" && (
                <Link to={`/blog/${p.id}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs"><Eye className="w-3 h-3 mr-1"/>Ver</Button>
                </Link>
              )}
              <Button size="sm" variant="destructive" onClick={() => remove(p.id)} className="h-7 text-xs"><Trash2 className="w-3 h-3"/></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Post" : "Novo Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Título *</label>
              <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Resumo</label>
              <Input value={form.resumo} onChange={e => setForm({ ...form, resumo: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">URL da Capa (opcional)</label>
              <Input value={form.capa_url} onChange={e => setForm({ ...form, capa_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-semibold">Tags (separadas por vírgula)</label>
              <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="cultura, jogos" />
            </div>
            <div>
              <label className="text-sm font-semibold">Conteúdo *</label>
              <Textarea rows={10} value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => save(false)}>Salvar Rascunho</Button>
              <Button onClick={() => save(true)} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
                <Send className="w-4 h-4 mr-1"/> Enviar para Aprovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AlunoLayout>
  );
};

export default BlogAluno;
