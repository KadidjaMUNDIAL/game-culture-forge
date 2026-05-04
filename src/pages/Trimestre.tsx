import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { PublicLayout } from "@/components/site/PublicLayout";
import { EditablePage } from "@/components/site/EditablePage";
import { supabase } from "@/integrations/supabase/client";
import { FileText, BookOpen, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

type Material = {
  id: string; titulo: string; descricao: string | null;
  tipo: "apostila" | "material_extra" | "projeto";
  trimestre: number | null; arquivo_url: string | null; capa_url: string | null;
  integrantes: string[] | null; data_publicacao: string | null;
};

const Trimestre = () => {
  const { num } = useParams();
  const [materiais, setMateriais] = useState<Material[]>([]);

  useEffect(() => {
    if (!num) return;
    supabase.from("materiais").select("*")
      .eq("visivel_publico", true)
      .eq("trimestre", Number(num))
      .order("ordem")
      .then(({ data }) => setMateriais((data as any) || []));
  }, [num]);

  if (!num || !["1", "2", "3"].includes(num)) return <Navigate to="/" />;

  const apostilas = materiais.filter(m => m.tipo === "apostila");
  const projetos = materiais.filter(m => m.tipo === "projeto");

  return (
    <PublicLayout>
      <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-10">
        {num}º Trimestre
      </h2>

      {/* Apostila */}
      <section className="mb-16">
        <h3 className="section-title mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-pixelyellow" /> Apostila
        </h3>
        {apostilas.length === 0 ? (
          <div className="pixel-card"><p className="font-body text-muted-foreground">Apostila ainda não publicada.</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {apostilas.map(m => (
              <a key={m.id} href={m.arquivo_url || "#"} target="_blank" rel="noopener"
                className="pixel-card !p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
                {m.capa_url ? (
                  <img src={m.capa_url} className="w-full h-36 object-cover rounded" alt="" />
                ) : (
                  <div className="h-36 grid place-items-center bg-pixelyellow/10 rounded">
                    <FileText className="w-12 h-12 text-navy/40" />
                  </div>
                )}
                <h4 className="font-display text-lg uppercase text-navy leading-tight">{m.titulo}</h4>
                {m.descricao && <p className="font-body text-sm text-muted-foreground line-clamp-3">{m.descricao}</p>}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Projetos */}
      <section>
        <h3 className="section-title mb-10 flex items-center gap-2">
          <FileText className="w-6 h-6 text-pixelyellow" /> Projetos
        </h3>
        {projetos.length === 0 ? (
          <div className="pixel-card"><p className="font-body text-muted-foreground">Sem projetos publicados ainda.</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projetos.map(m => (
              <a key={m.id} href={m.arquivo_url || "#"} target="_blank" rel="noopener"
                className="pixel-card !p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
                {m.capa_url ? (
                  <img src={m.capa_url} className="w-full h-36 object-cover rounded" alt="" />
                ) : (
                  <div className="h-36 grid place-items-center bg-pixelyellow/10 rounded">
                    <FileText className="w-12 h-12 text-navy/40" />
                  </div>
                )}
                <h4 className="font-display text-lg uppercase text-navy leading-tight">{m.titulo}</h4>
                {m.descricao && <p className="font-body text-sm text-muted-foreground line-clamp-3">{m.descricao}</p>}
                {m.integrantes && m.integrantes.length > 0 && (
                  <p className="text-xs flex items-start gap-1 text-navy/80">
                    <Users className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{m.integrantes.join(", ")}</span>
                  </p>
                )}
                {m.data_publicacao && (
                  <p className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(m.data_publicacao), "dd/MM/yyyy")}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12 text-center">
        <Link to="/" className="font-ui text-sm text-navy underline">← Voltar ao início</Link>
      </div>
    </PublicLayout>
  );
};

export default Trimestre;
