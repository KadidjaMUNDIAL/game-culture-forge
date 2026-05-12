import { useEffect, useState } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Eye } from "lucide-react";
import { PdfViewer } from "@/components/aluno/PdfViewer";

type Material = {
  id: string; titulo: string; descricao: string | null;
  trimestre: number | null; arquivo_url: string | null; capa_url: string | null;
};

const isPdf = (url: string | null) => !!url && /\.pdf(\?|$)/i.test(url);

const ListagemMaterial = ({ tipo, titulo, descricao }: { tipo: "apostila" | "material_extra" | "projeto"; titulo: string; descricao: string }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Material[]>([]);
  const [viewing, setViewing] = useState<Material | null>(null);

  const trackView = (m: Material) => {
    if (!user) return;
    supabase.from("material_views").insert({ user_id: user.id, material_id: m.id }).then(() => {});
  };

  useEffect(() => {
    supabase.from("materiais").select("*").eq("tipo", tipo).order("trimestre").order("ordem").then(({ data }) => {
      setItems((data as any) || []);
    });
  }, [tipo]);

  const trimestres = [1, 2, 3];

  const Card = ({ m }: { m: Material }) => {
    const pdf = isPdf(m.arquivo_url);
    const handleClick = (e: React.MouseEvent) => {
      trackView(m);
      if (pdf) { e.preventDefault(); setViewing(m); }
    };
    return (
      <a href={m.arquivo_url || "#"} target="_blank" rel="noopener" onClick={handleClick}
        className="rounded-xl bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 p-4 hover:border-pixelyellow hover:-translate-y-1 transition-all flex flex-col gap-2 group">
        {m.capa_url ? (
          <img src={m.capa_url} className="w-full h-32 object-cover rounded" alt="" />
        ) : (
          <div className="h-32 grid place-items-center bg-pixelyellow/5 rounded relative overflow-hidden">
            <FileText className="w-12 h-12 text-pixelyellow/60" />
            {pdf && <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] px-1 rounded font-bold">PDF</span>}
          </div>
        )}
        <h3 className="font-display text-base text-pixelyellow uppercase leading-tight flex items-center gap-1">
          {m.titulo}
        </h3>
        {m.descricao && <p className="text-xs text-white/70 line-clamp-2">{m.descricao}</p>}
        {pdf && (
          <span className="text-[10px] text-pixelyellow/80 flex items-center gap-1 mt-auto">
            <Eye className="w-3 h-3" /> Clique para visualizar
          </span>
        )}
      </a>
    );
  };

  return (
    <AlunoLayout>
      <h1 className="font-display text-4xl uppercase text-pixelyellow">{titulo}</h1>
      <p className="font-body text-white/80 mt-1">{descricao}</p>

      {items.length === 0 ? (
        <p className="text-white/60 text-center py-12">Nenhum item disponível ainda.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {trimestres.map(t => {
            const list = items.filter(m => m.trimestre === t);
            if (list.length === 0) return null;
            return (
              <section key={t}>
                <h2 className="font-display text-xl uppercase text-pixelyellow mb-3">{t}º Trimestre</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map(m => <Card key={m.id} m={m} />)}
                </div>
              </section>
            );
          })}
          {(() => {
            const list = items.filter(m => !m.trimestre);
            if (list.length === 0) return null;
            return (
              <section>
                <h2 className="font-display text-xl uppercase text-pixelyellow mb-3">Outros</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map(m => <Card key={m.id} m={m} />)}
                </div>
              </section>
            );
          })()}
        </div>
      )}

      <PdfViewer
        open={!!viewing}
        onOpenChange={o => !o && setViewing(null)}
        url={viewing?.arquivo_url || null}
        titulo={viewing?.titulo || ""}
      />
    </AlunoLayout>
  );
};

export default ListagemMaterial;
