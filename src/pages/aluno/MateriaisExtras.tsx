import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { PlaceholderSection } from "@/components/aluno/PlaceholderSection";
import { FileText } from "lucide-react";

const MateriaisExtras = () => (
  <AlunoLayout>
    <h1 className="font-display text-4xl uppercase text-pixelyellow">Materiais Extras</h1>
    <p className="font-body text-white/80 mt-1">
      Conteúdos complementares postados pela professora.
    </p>
    <PlaceholderSection
      icon={FileText}
      title="Biblioteca de Materiais Auxiliares"
      description="Em breve: documentos, links, vídeos e mídias adicionais — tudo categorizado e disponível para download."
    />
  </AlunoLayout>
);

export default MateriaisExtras;
