import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RichRenderer } from "@/components/aluno/RichEditor";
import { Comentarios } from "@/components/blog/Comentarios";
import { Eye } from "lucide-react";
import { EditablePage } from "@/components/site/EditablePage";

const ADMIN_SENTINEL = "00000000-0000-0000-0000-000000000001";
const authorName = (id: string, map: Record<string, string>) =>
  id === ADMIN_SENTINEL ? "Kadidja" : (map[id] || "Aluno");

type PublicPost = {
  id: string; titulo: string; resumo: string | null; conteudo: string;
  capa_url: string | null; tags: string[]; published_at: string | null;
  visualizacoes: number; author_id: string;
};

const Blog = () => {
  const { id } = useParams();
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [single, setSingle] = useState<PublicPost | null>(null);
  const [authors, setAuthors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      if (id) {
        const { data } = await supabase.from("posts").select("*").eq("id", id).eq("status", "publicado").maybeSingle();
        if (data) {
          setSingle(data as any);
          await supabase.from("posts").update({ visualizacoes: (data as any).visualizacoes + 1 }).eq("id", id);
          const { data: prof } = await supabase.from("profiles").select("nome").eq("id", (data as any).author_id).maybeSingle();
          if (prof) setAuthors(a => ({ ...a, [(data as any).author_id]: prof.nome }));
        }
      } else {
        const { data } = await supabase.from("posts").select("*").eq("status", "publicado").order("published_at", { ascending: false });
        setPosts((data as any) || []);
        const ids = [...new Set((data || []).map((p: any) => p.author_id))];
        if (ids.length) {
          const { data: profs } = await supabase.from("profiles").select("id, nome").in("id", ids);
          if (profs) setAuthors(Object.fromEntries(profs.map((p: any) => [p.id, p.nome])));
        }
      }
    })();
  }, [id]);

  if (id && single) {
    return (
      <PublicLayout>
        <article className="max-w-3xl mx-auto">
          <Link to="/blog" className="font-ui text-sm text-navy underline">← Voltar ao Blog</Link>
          {single.capa_url && <img src={single.capa_url} alt="" className="w-full h-64 object-cover rounded-lg my-4 border-2 border-pixelyellow/40" />}
          <h1 className="font-display text-3xl md:text-5xl uppercase text-navy">{single.titulo}</h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
            <span>Por <strong>{authorName(single.author_id, authors)}</strong></span>
            <span>•</span>
            <span>{single.published_at ? format(new Date(single.published_at), "dd/MM/yyyy") : "—"}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{single.visualizacoes}</span>
          </p>
          {single.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {single.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 bg-pixelyellow text-navy rounded font-semibold">#{t}</span>
              ))}
            </div>
          )}
          {single.resumo && <p className="font-body italic text-lg mt-4 text-muted-foreground">{single.resumo}</p>}
          <div className="mt-6"><RichRenderer source={single.conteudo} /></div>
          <Comentarios postId={single.id} />
        </article>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-8">Blog</h2>
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">Ainda não há posts publicados.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(p => (
            <Link to={`/blog/${p.id}`} key={p.id} className="pixel-card !p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
              {p.capa_url && <img src={p.capa_url} className="w-full h-32 object-cover rounded" alt="" />}
              <h3 className="font-display text-lg uppercase text-navy leading-tight">{p.titulo}</h3>
              {p.resumo && <p className="font-body text-sm text-muted-foreground flex-1 line-clamp-3">{p.resumo}</p>}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{authorName(p.author_id, authors)}</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" />{p.visualizacoes}
                </span>
              </div>
              {p.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {p.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-pixelyellow text-navy rounded font-semibold">#{t}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </PublicLayout>
  );
};

export default Blog;
