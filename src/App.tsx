import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Disciplina from "./pages/Disciplina";
import Trimestre from "./pages/Trimestre";
import Blog from "./pages/Blog";
import AlunoArea from "./pages/AlunoArea";
import MeuPerfil from "./pages/aluno/MeuPerfil";
import Agenda from "./pages/aluno/Agenda";
import Apostila from "./pages/aluno/Apostila";
import MateriaisExtras from "./pages/aluno/MateriaisExtras";
import BlogAluno from "./pages/aluno/BlogAluno";
import AlunoGuard from "./pages/aluno/AlunoGuard";
import AdminArea from "./pages/AdminArea";
import AdminGuard from "./pages/admin/AdminGuard";
import AdminAgendaPage from "./pages/admin/AdminAgendaPage";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/disciplina" element={<Disciplina />} />
            <Route path="/trimestres/:num" element={<Trimestre />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/aluno" element={<AlunoArea />} />
            <Route element={<AlunoGuard />}>
              <Route path="/aluno/perfil" element={<MeuPerfil />} />
              <Route path="/aluno/agenda" element={<Agenda />} />
              <Route path="/aluno/apostila" element={<Apostila />} />
              <Route path="/aluno/materiais" element={<MateriaisExtras />} />
              <Route path="/aluno/blog" element={<BlogAluno />} />
            </Route>
            <Route path="/admin" element={<AdminArea />} />
            <Route element={<AdminGuard />}>
              <Route path="/admin/agenda" element={<AdminAgendaPage />} />
              <Route path="/admin/editor" element={<AdminPlaceholder title="Editar Visão Pública" />} />
              <Route path="/admin/alunos" element={<AdminPlaceholder title="Gerenciar Alunos" />} />
              <Route path="/admin/apostila" element={<AdminPlaceholder title="Apostila" />} />
              <Route path="/admin/projetos" element={<AdminPlaceholder title="Projetos" />} />
              <Route path="/admin/blog" element={<AdminPlaceholder title="Blog" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
