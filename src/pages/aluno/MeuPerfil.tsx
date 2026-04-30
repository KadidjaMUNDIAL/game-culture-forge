import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { WelcomeBanner } from "@/components/aluno/WelcomeBanner";
import { PlaceholderSection } from "@/components/aluno/PlaceholderSection";
import { Trophy } from "lucide-react";

const MeuPerfil = () => (
  <AlunoLayout>
    <WelcomeBanner />
    <PlaceholderSection
      icon={Trophy}
      title="Dashboard de Progresso"
      description="Em breve: dados da conta editáveis, nível, XP, estatísticas rápidas (dias seguidos, tarefas concluídas, apostilas lidas, posts aprovados) e grade de conquistas estilo inventário gamer."
    />
  </AlunoLayout>
);

export default MeuPerfil;
