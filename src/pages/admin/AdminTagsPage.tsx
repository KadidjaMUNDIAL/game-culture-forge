import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type T = { id: string; nome: string; cor: string };

const AdminTagsPage = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<T[]>([]);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#FFD700");

  const load = async () => {
    const { data } = await supabase.from("tags").select("*").order("nome");
    setList((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  const add = async () => {
    const n = nome.trim().toLowerCase().replace(/\s+/g, "-");
    if (!n) return toast.error("Informe o nome");
    const { error } = await supabase.from("tags").insert({ nome: n, cor });
    if (error) return toast.error(error.message);
    setNome("");
    toast.success("Tag criada");
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir tag?")) return;
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl uppercase text-navy flex items-center gap-2">
        <Tag className="w-7 h-7"/> Tags do Blog
      </h1>
      <p className="text-muted-foreground text-sm mt-1">Catálogo de tags sugeridas para os posts.</p>

      <div className="mt-6 bg-card border-2 border-navy/10 rounded-xl p-4 flex gap-2 items-end max-w-xl">
        <div className="flex-1">
          <label className="text-xs font-bold">Nome</label>
          <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: cultura-pop" />
        </div>
        <div>
          <label className="text-xs font-bold">Cor</label>
          <input type="color" value={cor} onChange={e => setCor(e.target.value)} className="h-10 w-14 rounded border" />
        </div>
        <Button onClick={add} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
          <Plus className="w-4 h-4 mr-1"/> Adicionar
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {list.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma tag.</p>}
        {list.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 font-semibold text-sm"
            style={{ borderColor: t.cor, color: t.cor, background: `${t.cor}15` }}>
            #{t.nome}
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <Trash2 className="w-3 h-3"/>
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminTagsPage;
