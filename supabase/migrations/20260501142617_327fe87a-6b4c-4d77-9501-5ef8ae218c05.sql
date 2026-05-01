DROP VIEW IF EXISTS public.ranking_alunos;
CREATE VIEW public.ranking_alunos
WITH (security_invoker = true) AS
SELECT id, nome, classe, xp, nivel, avatar_url
FROM public.profiles
ORDER BY xp DESC, nome ASC;