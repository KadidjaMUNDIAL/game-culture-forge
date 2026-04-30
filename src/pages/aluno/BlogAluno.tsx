import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { PlaceholderSection } from "@/components/aluno/PlaceholderSection";
import { MessageSquare, PenSquare, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

const BlogAluno = () => (
  <AlunoLayout>
    <h1 className="font-display text-4xl uppercase text-pixelyellow">Blog do Aluno</h1>
    <p className="font-body text-white/80 mt-1">
      Crie publicações e acompanhe seus posts.
    </p>

    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <Link
        to="/aluno/blog/criar"
        className="rounded-xl p-6 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/40 hover:border-pixelyellow hover:shadow-[0_0_18px_hsl(var(--yellow)/0.4)] transition-all"
      >
        <PenSquare className="w-8 h-8 text-pixelyellow mb-2" />
        <h3 className="font-display text-xl text-pixelyellow uppercase">Criar Post</h3>
        <p className="font-body text-white/70 text-sm mt-1">
          Escreva uma nova publicação e envie para aprovação.
        </p>
      </Link>
      <Link
        to="/aluno/blog/meus-posts"
        className="rounded-xl p-6 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/40 hover:border-pixelyellow hover:shadow-[0_0_18px_hsl(var(--yellow)/0.4)] transition-all"
      >
        <ListChecks className="w-8 h-8 text-pixelyellow mb-2" />
        <h3 className="font-display text-xl text-pixelyellow uppercase">Meus Posts</h3>
        <p className="font-body text-white/70 text-sm mt-1">
          Gerencie rascunhos, aguardando aprovação e publicados.
        </p>
      </Link>
    </div>

    <PlaceholderSection
      icon={MessageSquare}
      title="Editor e Gestão de Posts"
      description="Em breve: editor rico (negrito, listas, imagens, links), tags, status (rascunho/aguardando/publicado/reprovado), contadores de visualizações e comentários."
    />
  </AlunoLayout>
);

export default BlogAluno;
