import { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Save, X, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, Code2, LayoutPanelTop } from "lucide-react";

type Block =
  | { id: string; type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; url: string; alt?: string }
  | { id: string; type: "html"; html: string };

type Props = { slug: string; titulo: string; children: ReactNode };

const uid = () => Math.random().toString(36).slice(2, 9);

export const EditablePage = ({ slug, titulo, children }: Props) => {
  const [params, setParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const editMode = params.get("edit") === "1" && isAdmin;

  const [override, setOverride] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [openHtml, setOpenHtml] = useState(false);
  const [openBlocks, setOpenBlocks] = useState(false);
  const [draftHtml, setDraftHtml] = useState("");
  const [draftBlocks, setDraftBlocks] = useState<Block[]>([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_pages").select("html_override, blocos").eq("slug", slug).maybeSingle();
    setOverride((data?.html_override as string) || null);
    setBlocks(((data?.blocos as any) as Block[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [slug]);

  const saveHtml = async () => {
    const { error } = await supabase
      .from("site_pages")
      .upsert({ slug, titulo, html_override: draftHtml || null }, { onConflict: "slug" });
    if (error) return toast.error(error.message);
    setOverride(draftHtml || null);
    toast.success("HTML salvo!");
    setOpenHtml(false);
  };

  const saveBlocks = async () => {
    const { error } = await supabase
      .from("site_pages")
      .upsert({ slug, titulo, blocos: draftBlocks as any }, { onConflict: "slug" });
    if (error) return toast.error(error.message);
    setBlocks(draftBlocks);
    toast.success("Blocos salvos!");
    setOpenBlocks(false);
  };

  const reset = async () => {
    if (!confirm("Restaurar a visão padrão (apaga HTML e blocos personalizados)?")) return;
    const { error } = await supabase
      .from("site_pages")
      .upsert({ slug, titulo, html_override: null, blocos: [] as any }, { onConflict: "slug" });
    if (error) return toast.error(error.message);
    setOverride(null); setBlocks([]);
    toast.success("Visão padrão restaurada");
  };

  if (loading) return null;

  const renderBlocks = (list: Block[]) => (
    <div className="cms-blocks space-y-4">
      {list.map(b => {
        if (b.type === "heading") {
          const lvl = b.level || 2;
          const cls = "font-display uppercase text-navy " + (lvl === 1 ? "text-4xl md:text-5xl" : lvl === 2 ? "text-3xl md:text-4xl" : "text-2xl");
          if (lvl === 1) return <h1 key={b.id} className={cls}>{b.text}</h1>;
          if (lvl === 2) return <h2 key={b.id} className={cls}>{b.text}</h2>;
          return <h3 key={b.id} className={cls}>{b.text}</h3>;
        }
        if (b.type === "paragraph") return <p key={b.id} className="font-body text-base leading-relaxed">{b.text}</p>;
        if (b.type === "image") return <img key={b.id} src={b.url} alt={b.alt || ""} className="w-full max-h-[480px] object-cover rounded-lg border-2 border-pixelyellow/40" />;
        if (b.type === "html") return <div key={b.id} dangerouslySetInnerHTML={{ __html: b.html }} />;
        return null;
      })}
    </div>
  );

  const content = override
    ? <div className="cms-override" dangerouslySetInnerHTML={{ __html: override }} />
    : blocks.length > 0
      ? renderBlocks(blocks)
      : children;

  const move = (i: number, dir: -1 | 1) => {
    const next = [...draftBlocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setDraftBlocks(next);
  };
  const update = (i: number, patch: Partial<Block>) => {
    const next = [...draftBlocks];
    next[i] = { ...next[i], ...patch } as Block;
    setDraftBlocks(next);
  };
  const remove = (i: number) => setDraftBlocks(draftBlocks.filter((_, k) => k !== i));
  const add = (type: Block["type"]) => {
    const base: any = { id: uid(), type };
    if (type === "heading") Object.assign(base, { text: "Novo título", level: 2 });
    if (type === "paragraph") Object.assign(base, { text: "Novo parágrafo..." });
    if (type === "image") Object.assign(base, { url: "", alt: "" });
    if (type === "html") Object.assign(base, { html: "<p>HTML livre</p>" });
    setDraftBlocks([...draftBlocks, base]);
  };

  return (
    <div className={editMode ? "relative ring-[3px] ring-pixelred ring-offset-2" : ""}>
      {editMode && (
        <div className="sticky top-2 z-50 flex flex-wrap gap-2 justify-end mb-4 px-4">
          <div className="bg-pixelred text-white px-3 py-1.5 rounded font-display text-sm uppercase shadow-lg">
            Modo edição: {titulo}
          </div>
          <Button size="sm" onClick={() => { setDraftBlocks(blocks); setOpenBlocks(true); }} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
            <LayoutPanelTop className="w-3 h-3 mr-1" /> Blocos
          </Button>
          <Button size="sm" onClick={() => { setDraftHtml(override || ""); setOpenHtml(true); }} variant="outline">
            <Code2 className="w-3 h-3 mr-1" /> HTML/CSS
          </Button>
          {(override || blocks.length > 0) && (
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

      {/* Editor de Blocos */}
      <Dialog open={openBlocks} onOpenChange={setOpenBlocks}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Editor de blocos — {titulo}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Adicione, ordene ou remova blocos. Os blocos têm prioridade sobre a visão padrão (mas o HTML livre tem prioridade sobre os blocos).
          </p>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => add("heading")}><Plus className="w-3 h-3 mr-1"/>Título</Button>
            <Button size="sm" variant="outline" onClick={() => add("paragraph")}><Plus className="w-3 h-3 mr-1"/>Parágrafo</Button>
            <Button size="sm" variant="outline" onClick={() => add("image")}><Plus className="w-3 h-3 mr-1"/>Imagem</Button>
            <Button size="sm" variant="outline" onClick={() => add("html")}><Plus className="w-3 h-3 mr-1"/>HTML</Button>
          </div>

          <div className="space-y-3 mt-2">
            {draftBlocks.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum bloco. Adicione um acima.</p>}
            {draftBlocks.map((b, i) => (
              <div key={b.id} className="border-2 border-muted rounded-lg p-3 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{b.type} #{i + 1}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(i, -1)}><ArrowUp className="w-3 h-3"/></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(i, 1)}><ArrowDown className="w-3 h-3"/></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(i)}><Trash2 className="w-3 h-3 text-destructive"/></Button>
                  </div>
                </div>
                {b.type === "heading" && (
                  <>
                    <select value={b.level || 2} onChange={e => update(i, { level: Number(e.target.value) as 1|2|3 })} className="text-xs border rounded px-2 py-1">
                      <option value={1}>H1 (gigante)</option><option value={2}>H2 (grande)</option><option value={3}>H3 (médio)</option>
                    </select>
                    <Input value={b.text} onChange={e => update(i, { text: e.target.value })} />
                  </>
                )}
                {b.type === "paragraph" && (
                  <Textarea value={b.text} onChange={e => update(i, { text: e.target.value })} rows={3} />
                )}
                {b.type === "image" && (
                  <>
                    <Input placeholder="URL da imagem" value={b.url} onChange={e => update(i, { url: e.target.value })} />
                    <Input placeholder="Texto alternativo" value={b.alt || ""} onChange={e => update(i, { alt: e.target.value })} />
                    {b.url && <img src={b.url} alt="" className="max-h-32 rounded" />}
                  </>
                )}
                {b.type === "html" && (
                  <Textarea value={b.html} onChange={e => update(i, { html: e.target.value })} rows={5} className="font-mono text-xs" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" onClick={() => setOpenBlocks(false)}>Cancelar</Button>
            <Button onClick={saveBlocks} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
              <Save className="w-4 h-4 mr-1"/> Salvar blocos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor HTML livre */}
      <Dialog open={openHtml} onOpenChange={setOpenHtml}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>HTML/CSS livre — {titulo}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">
            Substitui completamente a visão padrão e os blocos. Deixe vazio para voltar a usar blocos/visão padrão.
          </p>
          <Textarea value={draftHtml} onChange={e => setDraftHtml(e.target.value)} rows={20} className="font-mono text-xs"
            placeholder={`<style>\n  .meu-titulo { color: #c00; }\n</style>\n\n<h2 class="meu-titulo">Olá</h2>`} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenHtml(false)}>Cancelar</Button>
            <Button onClick={saveHtml} className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
              <Save className="w-4 h-4 mr-1"/> Salvar HTML
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
