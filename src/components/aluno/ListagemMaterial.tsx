import { useEffect, useState } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ExternalLink } from "lucide-react";

type Material = {
  id: string; titulo: string; descricao: string | null;
  trimestre: number | null; arquivo_url: string | null; capa_url: string | null;
};

const ListagemMaterial = ({ tipo, titulo, descricao }: { tipo: "apostila" | "material_extra" | "projeto"; titulo: string; descricao: string }) => {
  const [items, setItems] = useState<Material[]>([]);
  useEffect(() => {
    supabase.from("materiais").select("*").eq("tipo", tipo).order("trimestre").order("ordem").then(({ data }) => {
      setItems((data as any) || []);
    });
  }, [tipo]);

  const trimestres = [1, 2, 3];

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
                  {list.map(m => (
                    <a key={m.id} href={m.arquivo_url || "#"} target="_blank" rel="noopener"
                      className="rounded-xl bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 p-4 hover:border-pixelyellow transition-all flex flex-col gap-2">
                      {m.capa_url ? (
                        <img src={m.capa_url} className="w-full h-32 object-cover rounded" alt="" />
                      ) : (
                        <div className="h-32 grid place-items-center bg-pixelyellow/5 rounded">
                          <FileText className="w-12 h-12 text-pixelyellow/60" />
                        </div>
                      )}
                      <h3 className="font-display text-base text-pixelyellow uppercase leading-tight flex items-center gap-1">
                        {m.titulo} <ExternalLink className="w-3 h-3 inline" />
                      </h3>
                      {m.descricao && <p className="text-xs text-white/70 line-clamp-2">{m.descricao}</p>}
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
          {/* Sem trimestre */}
          {(() => {
            const list = items.filter(m => !m.trimestre);
            if (list.length === 0) return null;
            return (
              <section>
                <h2 className="font-display text-xl uppercase text-pixelyellow mb-3">Outros</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map(m => (
                    <a key={m.id} href={m.arquivo_url || "#"} target="_blank" rel="noopener"
                      className="rounded-xl bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/30 p-4 hover:border-pixelyellow transition-all">
                      <FileText className="w-8 h-8 text-pixelyellow mb-2" />
                      <h3 className="font-display text-base text-pixelyellow uppercase">{m.titulo}</h3>
                      {m.descricao && <p className="text-xs text-white/70 mt-1 line-clamp-2">{m.descricao}</p>}
                    </a>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>
      )}
    </AlunoLayout>
  );
};

export default ListagemMaterial;
