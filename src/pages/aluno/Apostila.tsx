import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { PlaceholderSection } from "@/components/aluno/PlaceholderSection";
import { BookOpen } from "lucide-react";

const Apostila = () => (
  <AlunoLayout>
    <h1 className="font-display text-4xl uppercase text-pixelyellow">Apostila</h1>
    <p className="font-body text-white/80 mt-1">
      Materiais oficiais da disciplina, organizados por trimestre.
    </p>
    <PlaceholderSection
      icon={BookOpen}
      title="Leitor de Apostilas Embutido"
      description="Em breve: navegação por trimestres (1º / 2º / 3º), grade de unidades e leitor de PDF embutido com zoom, navegação de páginas e download."
    />
  </AlunoLayout>
);

export default Apostila;
