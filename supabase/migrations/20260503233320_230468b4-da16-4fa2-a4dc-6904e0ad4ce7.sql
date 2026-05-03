
-- Tags do blog
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  cor text NOT NULL DEFAULT '#FFD700',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags: leitura pública" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Tags: admin gerencia" ON public.tags FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Tags: aluno cria via app" ON public.tags FOR INSERT TO authenticated
  WITH CHECK (true);

-- Páginas editáveis (CMS visão pública)
CREATE TABLE IF NOT EXISTS public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text,
  blocos jsonb NOT NULL DEFAULT '[]'::jsonb,
  html_override text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SitePages: leitura pública" ON public.site_pages FOR SELECT USING (true);
CREATE POLICY "SitePages: admin gerencia" ON public.site_pages FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER sitepages_updated_at BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed das páginas iniciais
INSERT INTO public.site_pages (slug, titulo) VALUES
  ('inicio','Início'),('disciplina','A Disciplina'),('blog','Blog'),
  ('trimestre-1','1º Trimestre'),('trimestre-2','2º Trimestre'),('trimestre-3','3º Trimestre')
ON CONFLICT (slug) DO NOTHING;

-- Comentários: permitir guests (sem login)
ALTER TABLE public.post_comments
  ALTER COLUMN author_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS author_nome text;
DROP POLICY IF EXISTS "Comments: inserir autenticado" ON public.post_comments;
DROP POLICY IF EXISTS "Comments: ver de posts publicados" ON public.post_comments;
CREATE POLICY "Comments: inserir qualquer um em post publicado" ON public.post_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'publicado')
    AND ( (auth.uid() IS NULL AND author_id IS NULL AND coalesce(length(trim(author_nome)),0) > 0)
       OR (auth.uid() = author_id) )
  );
CREATE POLICY "Comments: ver em post publicado" ON public.post_comments
  FOR SELECT TO anon, authenticated
  USING ( EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'publicado') );

-- Materiais: campos extras para apostila / projeto
ALTER TABLE public.materiais
  ADD COLUMN IF NOT EXISTS data_publicacao date,
  ADD COLUMN IF NOT EXISTS integrantes text[],
  ADD COLUMN IF NOT EXISTS arquivo_tipo text;

-- Storage: permitir authenticated subir CAPAS no bucket materiais (pasta 'capas/')
CREATE POLICY "Materiais: capas authenticated upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'materiais' AND (storage.foldername(name))[1] = 'capas');

CREATE POLICY "Materiais: capas authenticated update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'materiais' AND (storage.foldername(name))[1] = 'capas');
