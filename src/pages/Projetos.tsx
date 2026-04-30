import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ExternalLink } from "lucide-react";

type Material = {
  id: string; titulo: string; descricao: string | null;
  trimestre: number | null; arquivo_url: string | null; capa_url: string | null;
};

const Projetos = () => {
  const [items, setItems] = useState<Material[]>([]);
  useEffect(() => {
    supabase.from("materiais").select("*")
      .eq("tipo", "projeto").eq("visivel_publico", true)
      .order("trimestre").order("ordem")
      .then(({ data }) => setItems((data as any) || []));
  }, []);

  return (
    <PublicLayout>
      <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-8">Projetos</h2>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground">Em breve, projetos da turma serão publicados aqui.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(m => (
            <a key={m.id} href={m.arquivo_url || "#"} target="_blank" rel="noopener"
              className="pixel-card !p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
              {m.capa_url ? (
                <img src={m.capa_url} className="w-full h-32 object-cover rounded" alt="" />
              ) : (
                <div className="h-32 grid place-items-center bg-pixelyellow/10 rounded">
                  <FileText className="w-12 h-12 text-navy/40" />
                </div>
              )}
              <h3 className="font-display text-lg uppercase text-navy leading-tight flex items-center gap-1">
                {m.titulo} <ExternalLink className="w-3 h-3"/>
              </h3>
              {m.descricao && <p className="font-body text-sm text-muted-foreground line-clamp-3">{m.descricao}</p>}
              {m.trimestre && <span className="text-xs text-pixelyellow font-bold">T{m.trimestre}</span>}
            </a>
          ))}
        </div>
      )}
    </PublicLayout>
  );
};

export default Projetos;
