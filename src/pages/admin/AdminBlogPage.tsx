import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminAction } from "@/lib/adminAction";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, RotateCw, X, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

type Post = {
  id: string; titulo: string; resumo: string | null; conteudo: string;
  status: "rascunho" | "aguardando" | "publicado" | "reprovado";
  author_id: string; author_nome?: string; created_at: string;
  justificativa_reprovacao: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-gray-200 text-gray-700",
  aguardando: "bg-blue-100 text-blue-700",
  publicado: "bg-green-100 text-green-700",
  reprovado: "bg-red-100 text-red-700",
};

const AdminBlogPage = () => {
  const { isAdmin, adminPassword } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>("todos");
  const [moderating, setModerating] = useState<Post | null>(null);
  const [moderateAction, setModerateAction] = useState<"publicar" | "revisar" | "reprovar" | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [viewing, setViewing] = useState<Post | null>(null);

  const load = async () => {
    if (!adminPassword) return;
    try {
      const r = await adminAction<{ data: Post[] }>(adminPassword, { type: "list_all_posts" });
      setPosts(r.data || []);
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, [adminPassword]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const moderate = async () => {
    if (!moderating || !moderateAction || !adminPassword) return;
    try {
      await adminAction(adminPassword, {
        type: "moderate_post",
        payload: { id: moderating.id, action: moderateAction, justificativa: justificativa.trim() || undefined },
      });
      toast.success("Ação aplicada!");
      setModerating(null); setModerateAction(null); setJustificativa("");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir definitivamente?")) return;
    if (!adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "delete_post", payload: { id } });
      toast.success("Post excluído");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = filter === "todos" ? posts : posts.filter(p => p.status === filter);

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl uppercase text-navy">Gerenciar Blog</h1>
      <p className="font-body text-muted-foreground mt-1">Modere posts dos alunos.</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {["todos", "aguardando", "publicado", "rascunho", "reprovado"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="capitalize">
            {s} {s !== "todos" && `(${posts.filter(p => p.status === s).length})`}
          </Button>
        ))}
      </div>

      <div className="mt-4 bg-card border-2 border-navy/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Autor</th>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum post.</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-semibold">{p.titulo}</td>
                <td className="p-3">{p.author_nome}</td>
                <td className="p-3 text-xs">{format(new Date(p.created_at), "dd/MM/yyyy")}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setViewing(p)} className="h-7 w-7"><Eye className="w-3.5 h-3.5"/></Button>
                    <Button size="sm" variant="outline" onClick={() => { setModerating(p); setModerateAction(null); }} className="h-7 text-xs">Moderar</Button>
                    <Button size="icon" variant="destructive" onClick={() => remove(p.id)} className="h-7 w-7"><Trash2 className="w-3.5 h-3.5"/></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal moderação */}
      <Dialog open={!!moderating} onOpenChange={o => { if (!o) { setModerating(null); setModerateAction(null); setJustificativa(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderar: {moderating?.titulo}</DialogTitle>
          </DialogHeader>
          {!moderateAction ? (
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={() => setModerateAction("publicar")} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2"/> PUBLICAR
              </Button>
              <Button onClick={() => setModerateAction("revisar")} variant="outline">
                <RotateCw className="w-4 h-4 mr-2"/> REVISAR (volta a rascunho)
              </Button>
              <Button onClick={() => setModerateAction("reprovar")} variant="destructive">
                <X className="w-4 h-4 mr-2"/> REPROVAR
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">Ação selecionada: <strong className="uppercase">{moderateAction}</strong></p>
              {moderateAction === "reprovar" && (
                <div>
                  <label className="text-sm font-semibold">Justificativa *</label>
                  <Textarea value={justificativa} onChange={e => setJustificativa(e.target.value)} rows={4} placeholder="Explique o motivo..." />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModerateAction(null)}>Voltar</Button>
                <Button onClick={moderate} disabled={moderateAction === "reprovar" && !justificativa.trim()}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal visualizar */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.titulo}</DialogTitle>
          </DialogHeader>
          {viewing?.resumo && <p className="text-sm italic text-muted-foreground">{viewing.resumo}</p>}
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{viewing?.conteudo}</div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlogPage;
