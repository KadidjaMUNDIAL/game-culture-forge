import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { LoginAlunoModal } from "./LoginAlunoModal";
import { AdminPasswordModal } from "./AdminPasswordModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { label: "INÍCIO", to: "/" },
  { label: "A DISCIPLINA", to: "/disciplina" },
  { label: "BLOG", to: "/blog" },
];

const trimestres = [
  { label: "1º Trimestre", to: "/trimestres/1" },
  { label: "2º Trimestre", to: "/trimestres/2" },
  { label: "3º Trimestre", to: "/trimestres/3" },
];

export const SiteNav = () => {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { user, isAdmin } = useAuth();
  const [openMobile, setOpenMobile] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const trimAtivo = pathname.startsWith("/trimestres");

  const goAluno = () => {
    if (user) nav("/aluno");
    else setOpenLogin(true);
  };
  const goAdmin = () => {
    if (isAdmin) nav("/admin");
    else setOpenAdmin(true);
  };

  return (
    <>
      <nav className="container -mt-2 mb-8" aria-label="Navegação principal">
        <div className="nav-pill mx-auto rounded-full px-3 md:px-6 py-2.5 md:py-3 w-full md:w-[90%] flex items-center justify-between">
          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-2 mx-auto relative z-10">
            {items.map((it) => (
              <li key={it.to}>
                <NavLink to={it.to} className={`nav-btn ${isActive(it.to) ? "nav-btn-active" : ""}`}>
                  {it.label}
                </NavLink>
              </li>
            ))}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger className={`nav-btn flex items-center gap-1 ${trimAtivo ? "nav-btn-active" : ""}`}>
                  TRIMESTRES <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-navy text-white border-pixelyellow border-2">
                  {trimestres.map((t) => (
                    <DropdownMenuItem key={t.to} onClick={() => nav(t.to)} className="font-ui cursor-pointer focus:bg-pixelyellow focus:text-navy">
                      {t.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <button onClick={goAluno} className={`nav-btn ${pathname.startsWith("/aluno") ? "nav-btn-active" : ""}`}>
                ÁREA DO ALUNO
              </button>
            </li>
            <li>
              <button onClick={goAdmin} className={`nav-btn nav-btn-restrict ${pathname.startsWith("/admin") ? "nav-btn-active" : ""}`}>
                ÁREA RESTRITA
              </button>
            </li>
          </ul>

          {/* Mobile trigger */}
          <button
            className="md:hidden text-white p-2 relative z-10"
            onClick={() => setOpenMobile((v) => !v)}
            aria-label="Menu"
          >
            {openMobile ? <X /> : <Menu />}
          </button>
          <span className="md:hidden font-display text-white text-xl relative z-10">MENU</span>
        </div>

        {/* Mobile dropdown */}
        {openMobile && (
          <div className="md:hidden mt-3 bg-navy border-2 border-pixelyellow rounded-xl p-3 flex flex-col gap-2 animate-fade-in">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} onClick={() => setOpenMobile(false)} className={`nav-btn text-center ${isActive(it.to) ? "nav-btn-active" : ""}`}>
                {it.label}
              </NavLink>
            ))}
            {trimestres.map((t) => (
              <NavLink key={t.to} to={t.to} onClick={() => setOpenMobile(false)} className={`nav-btn text-center ${pathname === t.to ? "nav-btn-active" : ""}`}>
                {t.label}
              </NavLink>
            ))}
            <button onClick={() => { setOpenMobile(false); goAluno(); }} className="nav-btn">ÁREA DO ALUNO</button>
            <button onClick={() => { setOpenMobile(false); goAdmin(); }} className="nav-btn nav-btn-restrict">ÁREA RESTRITA</button>
          </div>
        )}
      </nav>

      <LoginAlunoModal open={openLogin} onOpenChange={setOpenLogin} onSuccess={() => nav("/aluno")} />
      <AdminPasswordModal open={openAdmin} onOpenChange={setOpenAdmin} onSuccess={() => nav("/admin")} />
    </>
  );
};
