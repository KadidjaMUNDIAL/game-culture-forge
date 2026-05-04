import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminAction } from "@/lib/adminAction";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff, Upload } from "lucide-react";
import { ImageUpload } from "@/components/aluno/ImageUpload";

type MaterialTipo = "apostila" | "material_extra" | "projeto";
type Material = {
  id: string; titulo: string; descricao: string | null; tipo: MaterialTipo;
  trimestre: number | null; arquivo_url: string | null; arquivo_path: string | null;
  capa_url: string | null; visivel_publico: boolean; ordem: number; created_at: string;
  integrantes: string[] | null; data_publicacao: string | null;
};

const TIPO_LABEL: Record<MaterialTipo, string> = {
  apostila: "Apostila", material_extra: "Material Extra", projeto: "Projeto",
};

const AdminMateriaisPage = ({ tipoFixo }: { tipoFixo?: MaterialTipo }) => {
  const { isAdmin, adminPassword } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    titulo: "", descricao: "", tipo: (tipoFixo || "apostila") as MaterialTipo,
    trimestre: 1 as number | null, arquivo_url: "", arquivo_path: "", capa_url: "",
    visivel_publico: false, ordem: 0,
    integrantes: "" as string, data_publicacao: "" as string,
  });

  const load = async () => {
    let q = supabase.from("materiais").select("*").order("ordem").order("created_at", { ascending: false });
    if (tipoFixo) q = q.eq("tipo", tipoFixo);
    const { data } = await q;
    setItems((data as any) || []);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin, tipoFixo]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const openNew = () => {
    setEditing(null);
    setForm({ titulo: "", descricao: "", tipo: tipoFixo || "apostila", trimestre: 1, arquivo_url: "", arquivo_path: "", capa_url: "", visivel_publico: false, ordem: 0, integrantes: "", data_publicacao: "" });
    setOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditing(m);
    setForm({
      titulo: m.titulo, descricao: m.descricao || "", tipo: m.tipo,
      trimestre: m.trimestre, arquivo_url: m.arquivo_url || "", arquivo_path: m.arquivo_path || "",
      capa_url: m.capa_url || "", visivel_publico: m.visivel_publico, ordem: m.ordem,
      integrantes: (m.integrantes || []).join(", "),
      data_publicacao: m.data_publicacao || "",
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!adminPassword) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${form.tipo}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const r = await adminAction<{ data: { signedUrl: string; token: string; path: string; publicUrl: string } }>(
        adminPassword, { type: "sign_material_upload", payload: { path } }
      );
      const { error } = await supabase.storage.from("materiais").uploadToSignedUrl(r.data.path, r.data.token, file);
      if (error) throw error;
      setForm(f => ({ ...f, arquivo_url: r.data.publicUrl, arquivo_path: r.data.path }));
      toast.success("Arquivo enviado!");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!adminPassword || !form.titulo.trim()) return toast.error("Título obrigatório");
    const payload: any = {
      ...form,
      integrantes: form.integrantes.split(",").map(s => s.trim()).filter(Boolean),
      data_publicacao: form.data_publicacao || null,
    };
    try {
      if (editing) {
        await adminAction(adminPassword, { type: "update_material", payload: { id: editing.id, ...payload } });
      } else {
        await adminAction(adminPassword, { type: "create_material", payload });
      }
      toast.success("Salvo!");
      setOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir material?") || !adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "delete_material", payload: { id } });
      toast.success("Excluído");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleVisible = async (m: Material) => {
    if (!adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "update_material", payload: { id: m.id, visivel_publico: !m.visivel_publico } });
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const title = tipoFixo ? TIPO_LABEL[tipoFixo] : "Materiais";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase text-navy">Gerenciar {title}</h1>
          <p className="text-muted-foreground text-sm">Faça upload de PDFs e gerencie a visibilidade.</p>
        </div>
        <Button onClick={openNew} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90"><Plus className="w-4 h-4 mr-1"/>Novo</Button>
      </div>

      <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">Nenhum item.</p>}
        {items.map(m => (
          <div key={m.id} className="bg-card border-2 border-navy/10 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <FileText className="w-6 h-6 text-pixelyellow" />
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleVisible(m)} title={m.visivel_publico ? "Tornar privado" : "Tornar público"}>
                  {m.visivel_publico ? <Eye className="w-4 h-4 text-green-600"/> : <EyeOff className="w-4 h-4"/>}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(m)}><Pencil className="w-4 h-4"/></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(m.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
              </div>
            </div>
            <h3 className="font-display text-base text-navy uppercase leading-tight">{m.titulo}</h3>
            {m.descricao && <p className="text-xs text-muted-foreground line-clamp-2">{m.descricao}</p>}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-muted rounded">{TIPO_LABEL[m.tipo]}</span>
              {m.trimestre && <span>T{m.trimestre}</span>}
              {m.arquivo_url && <a href={m.arquivo_url} target="_blank" className="underline ml-auto">Abrir</a>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Material</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Título *</label>
              <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold">Descrição</label>
              <Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} />
            </div>
            {!tipoFixo && (
              <div>
                <label className="text-sm font-semibold">Tipo</label>
                <Select value={form.tipo} onValueChange={(v: MaterialTipo) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apostila">Apostila</SelectItem>
                    <SelectItem value="material_extra">Material Extra</SelectItem>
                    <SelectItem value="projeto">Projeto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold">Trimestre</label>
              <Select value={String(form.trimestre || "")} onValueChange={v => setForm({ ...form, trimestre: v ? Number(v) : null })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Trimestre</SelectItem>
                  <SelectItem value="2">2º Trimestre</SelectItem>
                  <SelectItem value="3">3º Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Arquivo (PDF)</label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="application/pdf,image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
                {uploading && <Upload className="w-4 h-4 animate-pulse" />}
              </div>
              {form.arquivo_url && <a href={form.arquivo_url} target="_blank" className="text-xs underline text-blue-600">Ver arquivo atual</a>}
            </div>
            <ImageUpload bucket="materiais" pathPrefix={`capas/${form.tipo}`} value={form.capa_url} onChange={v => setForm({ ...form, capa_url: v })} label="Capa (opcional)" />
            {form.tipo === "projeto" && (
              <>
                <div>
                  <label className="text-sm font-semibold">Integrantes (separados por vírgula)</label>
                  <Input value={form.integrantes} onChange={e => setForm({ ...form, integrantes: e.target.value })} placeholder="Ana, Bruno, Carla" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Data de publicação</label>
                  <Input type="date" value={form.data_publicacao} onChange={e => setForm({ ...form, data_publicacao: e.target.value })} />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="vis" checked={form.visivel_publico} onChange={e => setForm({ ...form, visivel_publico: e.target.checked })} />
              <label htmlFor="vis" className="text-sm">Visível na página pública</label>
            </div>
            <div>
              <label className="text-sm font-semibold">Ordem</label>
              <Input type="number" value={form.ordem} onChange={e => setForm({ ...form, ordem: Number(e.target.value) })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMateriaisPage;
