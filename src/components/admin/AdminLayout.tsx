import { ReactNode, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, Calendar, BookOpen, FolderKanban, MessageSquare, FileText, LogOut, Eye, ChevronDown, ChevronRight } from "lucide-react";

const items = [
  { icon: Home, label: "INÍCIO", to: "/admin" },
  { icon: Users, label: "GERENCIAR ALUNOS", to: "/admin/alunos" },
  { icon: Calendar, label: "AGENDA", to: "/admin/agenda" },
  { icon: BookOpen, label: "APOSTILA", to: "/admin/apostila" },
  { icon: FileText, label: "MATERIAIS EXTRAS", to: "/admin/materiais" },
  { icon: FolderKanban, label: "PROJETOS", to: "/admin/projetos" },
  { icon: MessageSquare, label: "BLOG", to: "/admin/blog" },
];

const publicPages = [
  { label: "INÍCIO", to: "/?edit=1" },
  { label: "A DISCIPLINA", to: "/disciplina?edit=1" },
  { label: "BLOG", to: "/blog?edit=1" },
  { label: "1º TRIMESTRE", to: "/trimestres/1?edit=1" },
  { label: "2º TRIMESTRE", to: "/trimestres/2?edit=1" },
  { label: "3º TRIMESTRE", to: "/trimestres/3?edit=1" },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));

  return (
    <div className="h-screen flex bg-muted/40 overflow-hidden">
      <aside className="w-64 bg-navy text-white flex flex-col p-4 h-screen sticky top-0">
        <h2 className="font-display text-xl text-pixelyellow text-center uppercase">Área Restrita</h2>
        <div className="h-0.5 bg-pixelyellow/50 my-3" />
        <nav className="flex-1 flex flex-col gap-1">
          {items.map((it) => {
            const active = isActive(it.to);
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/admin"}
                className={`flex items-center gap-3 px-3 py-2 rounded-md font-ui text-sm transition-all ${
                  active
                    ? "bg-white/15 text-pixelyellow font-semibold"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <it.icon className="w-4 h-4" />
                {it.label}
              </NavLink>
            );
          })}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md font-ui text-sm text-white/80 hover:bg-pixelred/30 mt-auto"
          >
            <LogOut className="w-4 h-4" /> SAIR
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen animate-fade-in">{children}</main>
    </div>
  );
};
