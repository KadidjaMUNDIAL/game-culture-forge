-- ============== CONQUISTAS SEED ==============
INSERT INTO public.conquistas (codigo, titulo, descricao, icone, xp_recompensa) VALUES
  ('PRIMEIRO_LOGIN', 'Primeiro Passo', 'Bem-vindo(a) à Área do Aluno!', 'sparkles', 20),
  ('PRIMEIRA_TAREFA', 'Mãos à Obra', 'Concluiu sua primeira tarefa.', 'check-circle', 30),
  ('DEZ_TAREFAS', 'Disciplinado', 'Concluiu 10 tarefas.', 'target', 80),
  ('PRIMEIRO_POST', 'Voz Ativa', 'Publicou seu primeiro post no blog.', 'pen-tool', 50),
  ('NIVEL_5', 'Em Ascensão', 'Alcançou o nível 5.', 'trending-up', 100),
  ('NIVEL_10', 'Veterano', 'Alcançou o nível 10.', 'crown', 200)
ON CONFLICT (codigo) DO NOTHING;

-- ============== UNIQUE constraint para evitar duplicatas ==============
DO $$ BEGIN
  ALTER TABLE public.conquistas ADD CONSTRAINT conquistas_codigo_unique UNIQUE (codigo);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.user_conquistas ADD CONSTRAINT user_conquistas_unique UNIQUE (user_id, conquista_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============== FUNÇÃO PARA DESBLOQUEAR CONQUISTA ==============
CREATE OR REPLACE FUNCTION public.unlock_conquista(_user_id uuid, _codigo text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conquista_id uuid;
  _xp integer;
  _inserted boolean := false;
BEGIN
  SELECT id, xp_recompensa INTO _conquista_id, _xp FROM public.conquistas WHERE codigo = _codigo;
  IF _conquista_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.user_conquistas (user_id, conquista_id)
  VALUES (_user_id, _conquista_id)
  ON CONFLICT (user_id, conquista_id) DO NOTHING
  RETURNING true INTO _inserted;
  IF _inserted THEN
    PERFORM public.add_xp(_user_id, _xp);
  END IF;
END;
$$;

-- ============== TRIGGER: ao concluir tarefa ==============
CREATE OR REPLACE FUNCTION public.on_task_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
  _new_nivel integer;
BEGIN
  -- XP por concluir
  PERFORM public.add_xp(NEW.user_id, 10);
  -- Primeira tarefa
  SELECT count(*) INTO _count FROM public.task_completions WHERE user_id = NEW.user_id;
  IF _count = 1 THEN PERFORM public.unlock_conquista(NEW.user_id, 'PRIMEIRA_TAREFA'); END IF;
  IF _count >= 10 THEN PERFORM public.unlock_conquista(NEW.user_id, 'DEZ_TAREFAS'); END IF;
  -- Verifica nível
  SELECT nivel INTO _new_nivel FROM public.profiles WHERE id = NEW.user_id;
  IF _new_nivel >= 5 THEN PERFORM public.unlock_conquista(NEW.user_id, 'NIVEL_5'); END IF;
  IF _new_nivel >= 10 THEN PERFORM public.unlock_conquista(NEW.user_id, 'NIVEL_10'); END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_completion ON public.task_completions;
CREATE TRIGGER trg_task_completion
AFTER INSERT ON public.task_completions
FOR EACH ROW EXECUTE FUNCTION public.on_task_completion();

-- ============== TRIGGER: ao publicar post ==============
CREATE OR REPLACE FUNCTION public.on_post_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
  _new_nivel integer;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM 'publicado' AND NEW.status = 'publicado')
     OR (TG_OP = 'INSERT' AND NEW.status = 'publicado') THEN
    PERFORM public.add_xp(NEW.author_id, 40);
    SELECT count(*) INTO _count FROM public.posts WHERE author_id = NEW.author_id AND status = 'publicado';
    IF _count = 1 THEN PERFORM public.unlock_conquista(NEW.author_id, 'PRIMEIRO_POST'); END IF;
    SELECT nivel INTO _new_nivel FROM public.profiles WHERE id = NEW.author_id;
    IF _new_nivel >= 5 THEN PERFORM public.unlock_conquista(NEW.author_id, 'NIVEL_5'); END IF;
    IF _new_nivel >= 10 THEN PERFORM public.unlock_conquista(NEW.author_id, 'NIVEL_10'); END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_published ON public.posts;
CREATE TRIGGER trg_post_published
AFTER INSERT OR UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.on_post_published();

-- ============== TRIGGER: primeiro login (no signup) ==============
CREATE OR REPLACE FUNCTION public.on_profile_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.unlock_conquista(NEW.id, 'PRIMEIRO_LOGIN');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_created ON public.profiles;
CREATE TRIGGER trg_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.on_profile_created();

-- ============== RANKING: VIEW pública (apenas nome, classe, xp, nivel, avatar) ==============
CREATE OR REPLACE VIEW public.ranking_alunos AS
SELECT id, nome, classe, xp, nivel, avatar_url
FROM public.profiles
ORDER BY xp DESC, nome ASC;

-- RLS para a view (via política na tabela: permitir todos verem ranking)
DROP POLICY IF EXISTS "Profiles: ranking visível autenticado" ON public.profiles;
CREATE POLICY "Profiles: ranking visível autenticado"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- ============== REALTIME ==============
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.user_conquistas REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_conquistas;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;