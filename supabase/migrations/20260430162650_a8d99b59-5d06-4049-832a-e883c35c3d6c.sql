-- =============================================
-- BLOCO 2: BLOG
-- =============================================
CREATE TYPE public.post_status AS ENUM ('rascunho', 'aguardando', 'publicado', 'reprovado');

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL DEFAULT '',
  resumo TEXT,
  capa_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status public.post_status NOT NULL DEFAULT 'rascunho',
  justificativa_reprovacao TEXT,
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts: ver publicados (todos) ou próprios"
ON public.posts FOR SELECT TO authenticated
USING (status = 'publicado' OR auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Posts: ver publicados (público)"
ON public.posts FOR SELECT TO anon
USING (status = 'publicado');

CREATE POLICY "Posts: inserir próprios"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Posts: atualizar próprios ou admin"
ON public.posts FOR UPDATE TO authenticated
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Posts: deletar próprios ou admin"
ON public.posts FOR DELETE TO authenticated
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments: ver de posts publicados"
ON public.post_comments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND (p.status = 'publicado' OR p.author_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

CREATE POLICY "Comments: inserir autenticado"
ON public.post_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Comments: deletar próprio ou admin"
ON public.post_comments FOR DELETE TO authenticated
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

-- =============================================
-- BLOCO 3: APOSTILAS, PROJETOS, MATERIAIS
-- =============================================
CREATE TYPE public.material_tipo AS ENUM ('apostila', 'material_extra', 'projeto');

CREATE TABLE public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo public.material_tipo NOT NULL,
  trimestre INTEGER CHECK (trimestre IN (1,2,3)),
  arquivo_url TEXT,
  arquivo_path TEXT,
  capa_url TEXT,
  visivel_publico BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materiais: ver autenticado"
ON public.materiais FOR SELECT TO authenticated USING (true);

CREATE POLICY "Materiais: ver públicos (anon)"
ON public.materiais FOR SELECT TO anon
USING (visivel_publico = true);

CREATE POLICY "Materiais: admin gerencia"
ON public.materiais FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER materiais_updated_at BEFORE UPDATE ON public.materiais
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('materiais', 'materiais', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-imagens', 'post-imagens', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Materiais: leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id IN ('materiais', 'post-imagens', 'avatars'));

CREATE POLICY "Materiais: admin upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'materiais' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Materiais: admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'materiais' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Materiais: admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'materiais' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Posts: usuários upload imagens"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-imagens' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Posts: usuários deletam próprias"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-imagens' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: usuários upload próprios"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: usuários atualizam próprios"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: usuários deletam próprios"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- BLOCO 4: GAMIFICAÇÃO
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nivel INTEGER NOT NULL DEFAULT 1;

-- Permitir admin ver todos profiles
CREATE POLICY "Profiles: admin vê todos"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Profiles: admin atualiza todos"
ON public.profiles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Profiles: admin deleta"
ON public.profiles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL DEFAULT 'trophy',
  xp_recompensa INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conquistas: todos veem" ON public.conquistas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Conquistas: admin gerencia" ON public.conquistas FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conquista_id UUID NOT NULL REFERENCES public.conquistas(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, conquista_id)
);

ALTER TABLE public.user_conquistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "UserConquistas: vê próprias ou admin" ON public.user_conquistas FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Seed conquistas
INSERT INTO public.conquistas (codigo, titulo, descricao, icone, xp_recompensa) VALUES
('PRIMEIRO_LOGIN', 'Primeira Jornada', 'Fez login pela primeira vez', 'log-in', 10),
('PRIMEIRA_TAREFA', 'Mãos à Obra', 'Concluiu sua primeira tarefa', 'check', 25),
('PRIMEIRO_POST', 'Voz Ativa', 'Publicou seu primeiro post no blog', 'pen', 50),
('LEITOR', 'Leitor Dedicado', 'Leu sua primeira apostila', 'book', 25),
('NIVEL_5', 'Aprendiz', 'Alcançou o nível 5', 'star', 100),
('NIVEL_10', 'Mestre', 'Alcançou o nível 10', 'crown', 200)
ON CONFLICT (codigo) DO NOTHING;

-- Função para adicionar XP e calcular nível
CREATE OR REPLACE FUNCTION public.add_xp(_user_id UUID, _amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  novo_xp INTEGER;
  novo_nivel INTEGER;
BEGIN
  UPDATE public.profiles SET xp = xp + _amount WHERE id = _user_id RETURNING xp INTO novo_xp;
  novo_nivel := GREATEST(1, FLOOR(novo_xp / 100.0)::INTEGER + 1);
  UPDATE public.profiles SET nivel = novo_nivel WHERE id = _user_id;
END;
$$;