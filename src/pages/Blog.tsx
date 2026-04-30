import { PublicLayout } from "@/components/site/PublicLayout";

const tagColors: Record<string, string> = {
  "Notícia": "bg-pixelred text-white",
  "Análise": "bg-navy text-white",
  "Cultura": "bg-pixelyellow text-navy",
  "Projeto": "bg-emerald-500 text-white",
};

const posts = [
  { id: 1, titulo: "O Início da Disciplina", data: "12/02/2026", capa: "", desc: "Conheça os primeiros passos da turma na disciplina.", tag: "Notícia" },
  { id: 2, titulo: "Huizinga e o Lúdico", data: "20/02/2026", capa: "", desc: "Uma introdução ao pensamento de Huizinga.", tag: "Análise" },
  { id: 3, titulo: "Cultura Gamer Brasileira", data: "01/03/2026", capa: "", desc: "Como o Brasil se relaciona com os games?", tag: "Cultura" },
  { id: 4, titulo: "Projeto: Jogo de Tabuleiro", data: "10/03/2026", capa: "", desc: "Os alunos criaram seus próprios tabuleiros.", tag: "Projeto" },
];

const Blog = () => (
  <PublicLayout>
    <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-8">Blog</h2>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {posts.map((p) => (
        <article key={p.id} className="pixel-card !p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform cursor-pointer">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg uppercase text-navy leading-tight flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-pixelyellow shrink-0" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
              {p.titulo}
            </h3>
            <span className="text-xs font-ui text-muted-foreground whitespace-nowrap">{p.data}</span>
          </div>
          {p.capa && <img src={p.capa} alt={p.titulo} className="w-full h-32 object-cover rounded" />}
          <p className="font-body text-sm text-muted-foreground flex-1">{p.desc}</p>
          <div>
            <span className={`inline-block px-2 py-1 text-xs font-ui font-semibold rounded ${tagColors[p.tag]}`}>{p.tag}</span>
          </div>
        </article>
      ))}
    </div>
  </PublicLayout>
);

export default Blog;
