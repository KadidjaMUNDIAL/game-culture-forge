-- ============================
-- BLOCO 1: AGENDA (Tarefas + Alertas)
-- ============================

-- Enum para tipo de alerta
CREATE TYPE public.alert_type AS ENUM ('URGENTE', 'ATENCAO', 'INFORMACAO', 'NOVO_MATERIAL');

-- Enum para origem da tarefa
CREATE TYPE public.task_origin AS ENUM ('aluno', 'professora');

-- ============================
-- TABLE: tasks
-- ============================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL, -- aluno (próprias tarefas) OU admin (broadcast: visível a todos)
  origin public.task_origin NOT NULL DEFAULT 'aluno',
  is_broadcast BOOLEAN NOT NULL DEFAULT false, -- true = tarefa da professora visível a todos os alunos
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_limite DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conclusões de tarefas broadcast (cada aluno marca individualmente)
CREATE TABLE public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Para tarefas próprias (não broadcast), usamos coluna concluida direto
ALTER TABLE public.tasks ADD COLUMN concluida BOOLEAN NOT NULL DEFAULT false;

-- ============================
-- TABLE: alerts
-- ============================
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo public.alert_type NOT NULL DEFAULT 'INFORMACAO',
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.alert_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(alert_id, user_id)
);

-- ============================
-- ENABLE RLS
-- ============================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_reads ENABLE ROW LEVEL SECURITY;

-- ============================
-- POLICIES: tasks
-- ============================
-- SELECT: dono vê suas tarefas; todos autenticados veem broadcast da professora
CREATE POLICY "Tasks: ver próprias ou broadcast"
ON public.tasks FOR SELECT TO authenticated
USING (auth.uid() = owner_id OR is_broadcast = true);

-- INSERT: dono cria tarefa própria; admin pode criar broadcast
CREATE POLICY "Tasks: inserir próprias (aluno) ou broadcast (admin)"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND (
    (is_broadcast = false AND origin = 'aluno')
    OR (is_broadcast = true AND origin = 'professora' AND public.has_role(auth.uid(), 'admin'))
  )
);

-- UPDATE: dono atualiza sua tarefa; admin atualiza broadcast
CREATE POLICY "Tasks: atualizar próprias ou admin atualiza broadcast"
ON public.tasks FOR UPDATE TO authenticated
USING (
  auth.uid() = owner_id
  OR (is_broadcast = true AND public.has_role(auth.uid(), 'admin'))
);

-- DELETE: dono deleta sua tarefa; admin deleta broadcast
CREATE POLICY "Tasks: deletar próprias ou admin deleta broadcast"
ON public.tasks FOR DELETE TO authenticated
USING (
  (auth.uid() = owner_id AND is_broadcast = false)
  OR (is_broadcast = true AND public.has_role(auth.uid(), 'admin'))
);

-- ============================
-- POLICIES: task_completions
-- ============================
CREATE POLICY "TaskCompletions: ver próprias"
ON public.task_completions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "TaskCompletions: inserir próprias"
ON public.task_completions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "TaskCompletions: deletar próprias"
ON public.task_completions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================
-- POLICIES: alerts
-- ============================
CREATE POLICY "Alerts: ver próprios ou broadcast"
ON public.alerts FOR SELECT TO authenticated
USING (auth.uid() = owner_id OR is_broadcast = true);

CREATE POLICY "Alerts: inserir próprios (aluno) ou broadcast (admin)"
ON public.alerts FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND (
    is_broadcast = false
    OR (is_broadcast = true AND public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Alerts: atualizar próprios ou admin atualiza broadcast"
ON public.alerts FOR UPDATE TO authenticated
USING (
  auth.uid() = owner_id
  OR (is_broadcast = true AND public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Alerts: deletar próprios ou admin deleta broadcast"
ON public.alerts FOR DELETE TO authenticated
USING (
  (auth.uid() = owner_id AND is_broadcast = false)
  OR (is_broadcast = true AND public.has_role(auth.uid(), 'admin'))
);

-- ============================
-- POLICIES: alert_reads
-- ============================
CREATE POLICY "AlertReads: ver próprios"
ON public.alert_reads FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "AlertReads: inserir próprios"
ON public.alert_reads FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================
-- TRIGGERS: updated_at
-- ============================
CREATE TRIGGER trg_tasks_touch
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_alerts_touch
BEFORE UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================
-- INDEXES
-- ============================
CREATE INDEX idx_tasks_owner ON public.tasks(owner_id);
CREATE INDEX idx_tasks_broadcast ON public.tasks(is_broadcast) WHERE is_broadcast = true;
CREATE INDEX idx_tasks_data_limite ON public.tasks(data_limite);
CREATE INDEX idx_alerts_owner ON public.alerts(owner_id);
CREATE INDEX idx_alerts_broadcast ON public.alerts(is_broadcast) WHERE is_broadcast = true;
CREATE INDEX idx_alerts_data_criacao ON public.alerts(data_criacao DESC);