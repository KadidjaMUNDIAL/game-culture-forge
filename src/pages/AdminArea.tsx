import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Edit, Users, Calendar, BookOpen, FolderKanban, MessageSquare } from "lucide-react";

const items = [
  { icon: Home, label: "INÍCIO", active: true },
  { icon: Edit, label: "EDITAR VISÃO PÚBLICA" },
  { icon: Users, label: "GERENCIAR ALUNOS" },
  { icon: Calendar, label: "AGENDA" },
  { icon: BookOpen, label: "APOSTILA" },
  { icon: FolderKanban, label: "PROJETOS" },
  { icon: MessageSquare, label: "BLOG" },
];

const AdminArea = () => {
  const { isAdmin, signOut } = useAuth();
  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="min-h-screen flex bg-muted/40">
      <aside className="w-64 bg-navy text-white flex flex-col p-4">
        <h2 className="font-display text-xl text-pixelyellow text-center uppercase">Área Restrita</h2>
        <div className="h-0.5 bg-pixelyellow/50 my-3" />
        <nav className="flex-1 flex flex-col gap-1">
          {items.map((it, i) => (
            <button
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-ui text-sm text-left ${it.active ? "bg-white/15 text-pixelyellow font-semibold" : "text-white/80 hover:bg-white/10"}`}
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </button>
          ))}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md font-ui text-sm text-white/80 hover:bg-pixelred/30 mt-auto"
          >
            <LogOut className="w-4 h-4" /> SAIR
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <h1 className="font-display text-4xl uppercase text-navy">Painel Administrativo</h1>
        <p className="font-body text-muted-foreground mt-1">Visão geral do site.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { titulo: "Alunos cadastrados", valor: "—" },
            { titulo: "Posts publicados", valor: "—" },
            { titulo: "Projetos publicados", valor: "—" },
            { titulo: "Último cadastro", valor: "—" },
          ].map((c, i) => (
            <div key={i} className="bg-card border-2 border-navy/10 rounded-xl p-5 shadow-sm">
              <p className="font-ui text-xs uppercase text-muted-foreground">{c.titulo}</p>
              <p className="font-display text-3xl text-navy mt-2">{c.valor}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pixel-card">
          <h2 className="font-display text-2xl uppercase text-navy mb-2">Em breve</h2>
          <p className="font-body text-muted-foreground">
            Editor visual da visão pública, gerenciamento de alunos, agenda compartilhada, apostilas (upload de PDF),
            projetos dos alunos, blog (criação e moderação) serão implementados nas próximas etapas.
          </p>
          <Button onClick={signOut} variant="outline" className="mt-4">Sair</Button>
        </div>
      </main>
    </div>
  );
};

export default AdminArea;
