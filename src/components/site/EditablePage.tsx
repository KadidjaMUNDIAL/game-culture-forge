import { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Save, X, RotateCcw } from "lucide-react";

type Props = { slug: string; titulo: string; children: ReactNode };

export const EditablePage = ({ slug, titulo, children }: Props) => {
  const [params, setParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const editMode = params.get("edit") === "1" && isAdmin;

  const [override, setOverride] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("site_pages").select("html_override").eq("slug", slug).maybeSingle();
      setOverride((data?.html_override as string) || null);
      setLoading(false);
    })();
  }, [slug]);

  const openEditor = () => {
    setDraft(override || "");
    setOpen(true);
  };

  const save = async () => {
    const { error } = await supabase
      .from("site_pages")
      .upsert({ slug, titulo, html_override: draft || null }, { onConflict: "slug" });
    if (error) return toast.error(error.message);
    setOverride(draft || null);
    toast.success("Página atualizada!");
    setOpen(false);
  };

  const reset = async () => {
    if (!confirm("Restaurar a visão padrão (apaga o HTML personalizado)?")) return;
    const { error } = await supabase
      .from("site_pages")
      .upsert({ slug, titulo, html_override: null }, { onConflict: "slug" });
    if (error) return toast.error(error.message);
    setOverride(null);
    toast.success("Visão padrão restaurada");
  };

  if (loading) return null;

  const content = override ? (
    <div className="cms-override" dangerouslySetInnerHTML={{ __html: override }} />
  ) : (
    children
  );

  return (
    <div className={editMode ? "relative ring-[3px] ring-pixelred ring-offset-2" : ""}>
      {editMode && (
        <div className="sticky top-2 z-50 flex gap-2 justify-end mb-4 px-4">
          <div className="bg-pixelred text-white px-3 py-1.5 rounded font-display text-sm uppercase shadow-lg">
            Modo edição: {titulo}
          </div>
          <Button size="sm" onClick={openEditor} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
            <Pencil className="w-3 h-3 mr-1" /> Editar HTML
          </Button>
          {override && (
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-3 h-3 mr-1" /> Padrão
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => { params.delete("edit"); setParams(params); }}>
            <X className="w-3 h-3 mr-1" /> Sair
          </Button>
        </div>
      )}
      {content}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Editar HTML/CSS — {titulo}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            HTML e CSS livres. Use <code>&lt;style&gt;</code> para estilos. Deixe vazio para usar a visão padrão.
          </p>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={20}
            className="font-mono text-xs"
            placeholder={`<style>\n  .meu-titulo { color: #c00; }\n</style>\n\n<h2 class="meu-titulo">Olá</h2>\n<p>Conteúdo personalizado.</p>`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
              <Save className="w-4 h-4 mr-1" /> Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
