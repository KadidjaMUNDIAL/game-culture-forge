import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, User, Calendar, BookOpen, FileText, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const items = [
  { icon: Home, label: "INÍCIO", to: "/aluno" },
  { icon: User, label: "MEU PERFIL", to: "/aluno/perfil" },
  { icon: Calendar, label: "AGENDA", to: "/aluno/agenda" },
  { icon: BookOpen, label: "APOSTILA", to: "/aluno/apostila" },
  { icon: FileText, label: "MATERIAIS EXTRAS", to: "/aluno/materiais" },
  { icon: MessageSquare, label: "BLOG", to: "/aluno/blog" },
];

export const AlunoLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut } = useAuth();
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === "/aluno" ? pathname === "/aluno" || pathname === "/aluno/perfil" : pathname.startsWith(to);

  return (
    <div className="min-h-screen flex bg-[hsl(220_70%_6%)] text-white">
      <aside className="w-60 shrink-0 bg-gradient-to-b from-[hsl(220_70%_8%)] to-[hsl(220_70%_4%)] border-r border-pixelyellow/20 flex flex-col p-4">
        <h2 className="font-display text-xl text-pixelyellow text-center uppercase">Área do Aluno</h2>
        <p className="text-center text-white/80 text-sm font-ui mt-1">
          Estudante: {profile?.nome ?? "Aluno"}
        </p>
        <div className="h-0.5 bg-pixelyellow my-3" />
        <nav className="flex-1 flex flex-col gap-1.5">
          {items.map((it) => {
            const active = isActive(it.to);
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/aluno"}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-ui text-sm transition-all ${
                  active
                    ? "bg-pixelyellow text-navy font-semibold shadow-[0_0_12px_hsl(var(--yellow)/0.4)]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <it.icon className="w-4 h-4" />
                {it.label}
              </NavLink>
            );
          })}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md font-ui text-sm text-white/80 hover:bg-pixelred/30 mt-auto transition-all"
          >
            <LogOut className="w-4 h-4" />
            SAIR
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto animate-fade-in">{children}</main>
    </div>
  );
};
