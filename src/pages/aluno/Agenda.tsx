import { useEffect, useState, useCallback } from "react";
import { AlunoLayout } from "@/components/aluno/AlunoLayout";
import { MonthCalendar } from "@/components/aluno/MonthCalendar";
import { TaskFormModal } from "@/components/aluno/TaskFormModal";
import { AlertFormModal } from "@/components/aluno/AlertFormModal";
import { TaskDetailsDialog } from "@/components/aluno/TaskDetailsDialog";
import { AlertDetailsDialog } from "@/components/aluno/AlertDetailsDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TaskRow, AlertRow, ALERT_TYPE_COLOR, ALERT_TYPE_LABEL } from "@/types/agenda";
import { Plus, Pencil, Trash2, Siren, AlertTriangle, Info, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Agenda = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertRow | null>(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [alertDetailsOpen, setAlertDetailsOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [{ data: t }, { data: a }] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").order("created_at", { ascending: false }),
    ]);
    setTasks((t as TaskRow[]) ?? []);
    setAlerts((a as AlertRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ====== Tarefas ======
  const myTasks = tasks.filter((t) => !t.is_broadcast && t.owner_id === user?.id);
  const teacherTasks = tasks.filter((t) => t.is_broadcast);

  const sortTasks = (list: TaskRow[]) =>
    [...list].sort((a, b) => Number(a.concluida) - Number(b.concluida));

  const createTask = async (data: { titulo: string; descricao: string; data_criacao: string; data_limite: string | null }) => {
    if (!user) return;
    const { error } = await supabase.from("tasks").insert({
      owner_id: user.id,
      origin: "aluno",
      is_broadcast: false,
      titulo: data.titulo,
      descricao: data.descricao || null,
      data_criacao: data.data_criacao,
      data_limite: data.data_limite,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Tarefa criada!");
    refresh();
  };

  const updateTask = async (id: string, data: { titulo: string; descricao: string; data_criacao: string; data_limite: string | null }) => {
    const { error } = await supabase.from("tasks").update({
      titulo: data.titulo,
      descricao: data.descricao || null,
      data_criacao: data.data_criacao,
      data_limite: data.data_limite,
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Tarefa atualizada!");
    refresh();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Excluir esta tarefa?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Tarefa removida.");
    refresh();
  };

  const toggleTask = async (t: TaskRow) => {
    if (t.is_broadcast) {
      // tarefa da professora: usar task_completions individual
      // simplificação: aluno marca como "concluída" criando registro local; aqui guardamos no state
      // para MVP funcional: vamos usar coluna concluida apenas em tarefas próprias.
      // Para broadcast: registrar em task_completions
      if (!user) return;
      const { data: existing } = await supabase
        .from("task_completions").select("id").eq("task_id", t.id).eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("task_completions").delete().eq("id", existing.id);
      } else {
        await supabase.from("task_completions").insert({ task_id: t.id, user_id: user.id });
      }
      refresh();
      return;
    }
    const { error } = await supabase.from("tasks").update({ concluida: !t.concluida }).eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };

  // ====== Alertas ======
  const createAlert = async (data: { titulo: string; mensagem: string; tipo: AlertRow["tipo"]; data_criacao: string }) => {
    if (!user) return;
    const { error } = await supabase.from("alerts").insert({
      owner_id: user.id,
      is_broadcast: false,
      titulo: data.titulo,
      mensagem: data.mensagem,
      tipo: data.tipo,
      data_criacao: data.data_criacao,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Alerta criado!");
    refresh();
  };

  const updateAlert = async (id: string, data: { titulo: string; mensagem: string; tipo: AlertRow["tipo"]; data_criacao: string }) => {
    const { error } = await supabase.from("alerts").update(data).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Alerta atualizado!");
    refresh();
  };

  const alertIcon = (t: AlertRow["tipo"]) => {
    switch (t) {
      case "URGENTE": return <Siren className="w-4 h-4 text-red-400" />;
      case "ATENCAO": return <AlertTriangle className="w-4 h-4 text-yellow-300" />;
      case "INFORMACAO": return <Info className="w-4 h-4 text-blue-300" />;
      case "NOVO_MATERIAL": return <BookOpen className="w-4 h-4 text-purple-300" />;
    }
  };

  return (
    <AlunoLayout>
      <h1 className="font-display text-4xl uppercase text-pixelyellow">Agenda</h1>
      <p className="font-body text-white/80 mt-1">Cronograma, tarefas e alertas em um só lugar.</p>

      {/* Calendário central */}
      <div className="mt-6">
        {loading ? (
          <div className="h-64 grid place-items-center text-white/60 font-display">Carregando...</div>
        ) : (
          <MonthCalendar tasks={tasks} />
        )}
      </div>

      {/* TO DO LIST + ALERTAS */}
      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        {/* TO DO LIST COMPLETO */}
        <div className="rounded-xl p-5 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xl uppercase text-pixelyellow">To Do List Completo</h3>
            <Button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
              className="btn-pixel-yellow !py-1.5 !px-3 text-xs">
              <Plus className="w-4 h-4 mr-1" /> NOVA TAREFA
            </Button>
          </div>

          {/* MINHAS TAREFAS */}
          <div className="mb-4">
            <p className="font-ui text-[10px] uppercase text-pixelyellow/80 mb-1">Minhas tarefas</p>
            <div className="h-px bg-pixelyellow/30 mb-2" />
            <ul className="space-y-1.5">
              {sortTasks(myTasks).length === 0 && (
                <li className="text-white/50 text-sm font-body">Nenhuma tarefa criada por você.</li>
              )}
              {sortTasks(myTasks).map((t) => (
                <li key={t.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded ${t.concluida ? "opacity-60" : ""} hover:bg-white/5`}>
                  <Checkbox checked={t.concluida} onCheckedChange={() => toggleTask(t)}
                    className="border-pixelyellow data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
                  <span className={`flex-1 font-ui text-sm text-white ${t.concluida ? "line-through" : ""}`}>{t.titulo}</span>
                  <span className="font-ui text-xs text-pixelyellow">
                    {t.data_limite ? format(new Date(t.data_limite), "dd/MM") : "—"}
                  </span>
                  <button onClick={() => { setEditingTask(t); setTaskModalOpen(true); }}
                    className="text-pixelyellow/70 hover:text-pixelyellow"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteTask(t.id)}
                    className="text-red-400/70 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </li>
              ))}
            </ul>
          </div>

          {/* TAREFAS DA PROFESSORA */}
          <div className="rounded-md bg-black/30 p-3 mb-3">
            <p className="font-ui text-[10px] uppercase text-pixelyellow/80 mb-1">Tarefas da professora</p>
            <div className="h-px bg-pixelyellow/30 mb-2" />
            <ul className="space-y-1.5">
              {teacherTasks.length === 0 && (
                <li className="text-white/50 text-sm font-body">Nenhuma tarefa enviada pela professora.</li>
              )}
              {teacherTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5">
                  <Checkbox onCheckedChange={() => toggleTask(t)}
                    className="border-pixelyellow data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
                  <span className="flex-1 font-ui text-sm text-white">{t.titulo}</span>
                  <span className="font-ui text-xs text-pixelyellow">
                    {t.data_limite ? format(new Date(t.data_limite), "dd/MM") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setTaskDetailsOpen(true)}
              className="rounded-full border-pixelyellow text-pixelyellow hover:bg-pixelyellow hover:text-navy">
              VER DETALHES DAS TAREFAS
            </Button>
          </div>
        </div>

        {/* ALERTAS */}
        <div className="rounded-xl p-5 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xl uppercase text-pixelyellow">Alertas Completos</h3>
            <Button onClick={() => { setEditingAlert(null); setAlertModalOpen(true); }}
              className="btn-pixel-yellow !py-1.5 !px-3 text-xs">
              <Plus className="w-4 h-4 mr-1" /> NOVO ALERTA
            </Button>
          </div>

          <ul className="space-y-2 mb-3 max-h-[420px] overflow-auto pr-1">
            {alerts.length === 0 && (
              <li className="text-white/50 text-sm font-body text-center py-6">Nenhum alerta cadastrado.</li>
            )}
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/5 hover:border-pixelyellow/40 transition-all">
                <div className="mt-0.5">{alertIcon(a.tipo)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-ui text-sm text-white font-semibold truncate">{a.titulo}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold whitespace-nowrap ${ALERT_TYPE_COLOR[a.tipo]}`}>
                      {ALERT_TYPE_LABEL[a.tipo]}
                    </span>
                  </div>
                  <p className="font-body text-xs text-white/70 mt-0.5 line-clamp-2">{a.mensagem}</p>
                  <p className="font-ui text-[10px] text-white/50 mt-1">
                    {format(new Date(a.data_criacao), "dd/MM/yyyy")}
                    {a.is_broadcast && <span className="ml-2 text-pixelyellow">• Professora</span>}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-center">
            <Button variant="outline" onClick={() => setAlertDetailsOpen(true)}
              className="rounded-full border-pixelyellow text-pixelyellow hover:bg-pixelyellow hover:text-navy">
              VER DETALHES DOS ALERTAS
            </Button>
          </div>
        </div>
      </div>

      {/* Modais */}
      <TaskFormModal
        open={taskModalOpen}
        onOpenChange={(v) => { setTaskModalOpen(v); if (!v) setEditingTask(null); }}
        initial={editingTask}
        title={editingTask ? "EDITAR TAREFA" : "NOVA TAREFA"}
        onSubmit={async (data) => {
          if (editingTask) await updateTask(editingTask.id, data);
          else await createTask(data);
        }}
      />
      <AlertFormModal
        open={alertModalOpen}
        onOpenChange={(v) => { setAlertModalOpen(v); if (!v) setEditingAlert(null); }}
        initial={editingAlert}
        title={editingAlert ? "EDITAR ALERTA" : "CRIAR NOVO ALERTA"}
        onSubmit={async (data) => {
          if (editingAlert) await updateAlert(editingAlert.id, data);
          else await createAlert(data);
        }}
      />
      <TaskDetailsDialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen} tasks={tasks} />
      <AlertDetailsDialog
        open={alertDetailsOpen}
        onOpenChange={setAlertDetailsOpen}
        alerts={alerts}
        ownUserId={user?.id}
        onEdit={(a) => { setEditingAlert(a); setAlertDetailsOpen(false); setAlertModalOpen(true); }}
      />
    </AlunoLayout>
  );
};

export default Agenda;
