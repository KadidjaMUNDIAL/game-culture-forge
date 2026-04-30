import { useEffect, useState, useCallback } from "react";
import { adminAction } from "@/lib/adminAction";
import { useAuth } from "@/contexts/AuthContext";
import { TaskRow, AlertRow, ALERT_TYPE_COLOR, ALERT_TYPE_LABEL } from "@/types/agenda";
import { TaskFormModal } from "@/components/aluno/TaskFormModal";
import { AlertFormModal } from "@/components/aluno/AlertFormModal";
import { TaskDetailsDialog } from "@/components/aluno/TaskDetailsDialog";
import { AlertDetailsDialog } from "@/components/aluno/AlertDetailsDialog";
import { MonthCalendar } from "@/components/aluno/MonthCalendar";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Siren, AlertTriangle, Info, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const AdminAgenda = () => {
  const { adminPassword } = useAuth();
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
    if (!adminPassword) return;
    setLoading(true);
    try {
      const [t, a] = await Promise.all([
        adminAction<{ data: TaskRow[] }>(adminPassword, { type: "list_broadcast_tasks" }),
        adminAction<{ data: AlertRow[] }>(adminPassword, { type: "list_broadcast_alerts" }),
      ]);
      setTasks(t.data ?? []);
      setAlerts(a.data ?? []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => { refresh(); }, [refresh]);

  const submitTask = async (data: { titulo: string; descricao: string; data_criacao: string; data_limite: string | null }) => {
    if (!adminPassword) return;
    try {
      if (editingTask) {
        await adminAction(adminPassword, {
          type: "update_broadcast_task",
          payload: { id: editingTask.id, ...data, descricao: data.descricao || null },
        });
        toast.success("Tarefa atualizada!");
      } else {
        await adminAction(adminPassword, {
          type: "create_broadcast_task",
          payload: { ...data, descricao: data.descricao || undefined },
        });
        toast.success("Tarefa enviada para os alunos!");
      }
      refresh();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteTask = async (id: string) => {
    if (!adminPassword || !confirm("Excluir esta tarefa?")) return;
    try {
      await adminAction(adminPassword, { type: "delete_broadcast_task", payload: { id } });
      toast.success("Tarefa removida.");
      refresh();
    } catch (err: any) { toast.error(err.message); }
  };

  const submitAlert = async (data: { titulo: string; mensagem: string; tipo: AlertRow["tipo"]; data_criacao: string }) => {
    if (!adminPassword) return;
    try {
      if (editingAlert) {
        await adminAction(adminPassword, { type: "update_broadcast_alert", payload: { id: editingAlert.id, ...data } });
        toast.success("Alerta atualizado!");
      } else {
        await adminAction(adminPassword, { type: "create_broadcast_alert", payload: data });
        toast.success("Alerta enviado para os alunos!");
      }
      refresh();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteAlert = async (id: string) => {
    if (!adminPassword || !confirm("Excluir este alerta?")) return;
    try {
      await adminAction(adminPassword, { type: "delete_broadcast_alert", payload: { id } });
      toast.success("Alerta removido.");
      refresh();
    } catch (err: any) { toast.error(err.message); }
  };

  const alertIcon = (t: AlertRow["tipo"]) => {
    switch (t) {
      case "URGENTE": return <Siren className="w-4 h-4 text-red-500" />;
      case "ATENCAO": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "INFORMACAO": return <Info className="w-4 h-4 text-blue-500" />;
      case "NOVO_MATERIAL": return <BookOpen className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl uppercase text-navy flex items-center gap-2">
          <Calendar className="w-8 h-8 text-pixelyellow" /> Agenda
        </h1>
        <p className="font-body text-muted-foreground mt-1">Gerencie tarefas e alertas para todos os alunos.</p>
      </div>

      {/* Calendário (modo escuro local) */}
      <div className="rounded-xl bg-[hsl(220_70%_6%)] p-1">
        {loading ? (
          <div className="h-64 grid place-items-center text-white/60 font-display">Carregando...</div>
        ) : (
          <MonthCalendar tasks={tasks} />
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Tarefas da Professora */}
        <div className="bg-card border-2 border-navy/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xl uppercase text-navy">Próximas Tarefas</h3>
            <Button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
              className="btn-pixel-yellow !py-1.5 !px-3 text-xs">
              <Plus className="w-4 h-4 mr-1" /> TAREFA
            </Button>
          </div>
          <ul className="space-y-2 max-h-96 overflow-auto">
            {tasks.length === 0 && (
              <li className="text-muted-foreground text-sm font-body text-center py-6">Nenhuma tarefa criada.</li>
            )}
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/40 group">
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-semibold truncate">{t.titulo}</p>
                  <p className="font-ui text-[11px] text-muted-foreground">
                    Criado {format(new Date(t.data_criacao), "dd/MM/yyyy")}
                    {t.data_limite && ` • Prazo ${format(new Date(t.data_limite), "dd/MM/yyyy")}`}
                  </p>
                </div>
                <button onClick={() => { setEditingTask(t); setTaskModalOpen(true); }}
                  className="text-muted-foreground hover:text-navy opacity-0 group-hover:opacity-100">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTask(t.id)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="text-center mt-3">
            <Button variant="outline" onClick={() => setTaskDetailsOpen(true)}
              className="rounded-full border-pixelyellow text-navy hover:bg-pixelyellow">
              VER DETALHES DAS TAREFAS
            </Button>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-card border-2 border-navy/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xl uppercase text-navy">Alertas</h3>
            <Button onClick={() => { setEditingAlert(null); setAlertModalOpen(true); }}
              className="btn-pixel-yellow !py-1.5 !px-3 text-xs">
              <Plus className="w-4 h-4 mr-1" /> ALERTA
            </Button>
          </div>
          <ul className="space-y-2 max-h-96 overflow-auto">
            {alerts.length === 0 && (
              <li className="text-muted-foreground text-sm font-body text-center py-6">Nenhum alerta criado.</li>
            )}
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border group">
                <div className="mt-0.5">{alertIcon(a.tipo)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-ui text-sm font-semibold truncate">{a.titulo}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold whitespace-nowrap ${ALERT_TYPE_COLOR[a.tipo]}`}>
                      {ALERT_TYPE_LABEL[a.tipo]}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.mensagem}</p>
                  <p className="font-ui text-[10px] text-muted-foreground mt-1">
                    {format(new Date(a.data_criacao), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => { setEditingAlert(a); setAlertModalOpen(true); }}
                    className="text-muted-foreground hover:text-navy"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteAlert(a.id)}
                    className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center mt-3">
            <Button variant="outline" onClick={() => setAlertDetailsOpen(true)}
              className="rounded-full border-pixelyellow text-navy hover:bg-pixelyellow">
              VER DETALHES DOS ALERTAS
            </Button>
          </div>
        </div>
      </div>

      <TaskFormModal
        open={taskModalOpen}
        onOpenChange={(v) => { setTaskModalOpen(v); if (!v) setEditingTask(null); }}
        initial={editingTask}
        title={editingTask ? "EDITAR TAREFA" : "NOVA TAREFA"}
        onSubmit={submitTask}
      />
      <AlertFormModal
        open={alertModalOpen}
        onOpenChange={(v) => { setAlertModalOpen(v); if (!v) setEditingAlert(null); }}
        initial={editingAlert}
        title={editingAlert ? "EDITAR ALERTA" : "CRIAR NOVO ALERTA"}
        onSubmit={submitAlert}
      />
      <TaskDetailsDialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen} tasks={tasks} />
      <AlertDetailsDialog open={alertDetailsOpen} onOpenChange={setAlertDetailsOpen} alerts={alerts} />
    </div>
  );
};
