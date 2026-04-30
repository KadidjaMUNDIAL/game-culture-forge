import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { PlaceholderSection } from "@/components/aluno/PlaceholderSection";
import { Calendar } from "lucide-react";

const Agenda = () => (
  <AlunoLayout>
    <h1 className="font-display text-4xl uppercase text-pixelyellow">Agenda</h1>
    <p className="font-body text-white/80 mt-1">
      Cronograma, To Do List e Alertas — tudo em um só lugar.
    </p>
    <PlaceholderSection
      icon={Calendar}
      title="Calendário + Tarefas + Alertas"
      description="Em breve: calendário mensal interativo, lista de tarefas (suas e da professora) e feed de alertas com criação, edição e exclusão."
    />
  </AlunoLayout>
);

export default Agenda;
