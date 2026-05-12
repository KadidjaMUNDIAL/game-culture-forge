-- MATERIAL VIEWS + LEITOR
CREATE TABLE IF NOT EXISTS public.material_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);
ALTER TABLE public.material_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MatViews: ver próprias" ON public.material_views FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "MatViews: inserir próprias" ON public.material_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

INSERT INTO public.conquistas (codigo, titulo, descricao, icone, xp_recompensa)
VALUES ('LEITOR', 'Leitor Dedicado', 'Leu sua primeira apostila.', 'book-open', 25)
ON CONFLICT (codigo) DO NOTHING;

CREATE OR REPLACE FUNCTION public.on_material_view()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tipo public.material_tipo;
BEGIN
  SELECT tipo INTO _tipo FROM public.materiais WHERE id = NEW.material_id;
  IF _tipo = 'apostila' THEN
    PERFORM public.unlock_conquista(NEW.user_id, 'LEITOR');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_material_view ON public.material_views;
CREATE TRIGGER trg_material_view AFTER INSERT ON public.material_views
  FOR EACH ROW EXECUTE FUNCTION public.on_material_view();

ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;