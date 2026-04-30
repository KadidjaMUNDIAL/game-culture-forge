import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminAction } from "@/lib/adminAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Aluno = { id: string; nome: string; classe: string; bio: string | null; xp: number; nivel: number; created_at: string };

const AdminAlunosPage = () => {
  const { isAdmin, adminPassword } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [editing, setEditing] = useState<Aluno | null>(null);
  const [form, setForm] = useState({ nome: "", classe: "", bio: "" });
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!adminPassword) return;
    try {
      const r = await adminAction<{ data: Aluno[] }>(adminPassword, { type: "list_alunos" });
      setAlunos(r.data || []);
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, [adminPassword]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const openEdit = (a: Aluno) => {
    setEditing(a);
    setForm({ nome: a.nome, classe: a.classe, bio: a.bio || "" });
  };

  const save = async () => {
    if (!editing || !adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "update_aluno", payload: { id: editing.id, ...form } });
      toast.success("Aluno atualizado");
      setEditing(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (a: Aluno) => {
    if (!confirm(`Excluir aluno "${a.nome}" definitivamente? Esta ação não pode ser desfeita.`)) return;
    if (!adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "delete_aluno", payload: { id: a.id } });
      toast.success("Aluno excluído");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = alunos.filter(a => a.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl uppercase text-navy">Gerenciar Alunos</h1>
      <p className="text-muted-foreground text-sm">Total: {alunos.length}</p>

      <Input placeholder="Buscar aluno..." value={search} onChange={e => setSearch(e.target.value)} className="mt-4 max-w-sm" />

      <div className="mt-4 bg-card border-2 border-navy/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Classe</th>
              <th className="text-left p-3">Nível</th>
              <th className="text-left p-3">XP</th>
              <th className="text-left p-3">Cadastro</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum aluno.</td></tr>}
            {filtered.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-semibold">{a.nome}</td>
                <td className="p-3">{a.classe}</td>
                <td className="p-3"><span className="bg-pixelyellow text-navy px-2 py-0.5 rounded text-xs font-bold">{a.nivel}</span></td>
                <td className="p-3">{a.xp}</td>
                <td className="p-3 text-xs">{format(new Date(a.created_at), "dd/MM/yyyy")}</td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)} className="h-7 w-7"><Pencil className="w-3.5 h-3.5"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(a)} className="h-7 w-7"><Trash2 className="w-3.5 h-3.5 text-destructive"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Aluno</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm">Nome</label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div><label className="text-sm">Classe</label><Input value={form.classe} onChange={e => setForm({ ...form, classe: e.target.value })} /></div>
            <div><label className="text-sm">Bio</label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save}>Salvar</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAlunosPage;
