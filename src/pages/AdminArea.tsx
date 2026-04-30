import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { adminAction } from "@/lib/adminAction";
import { TaskRow, AlertRow, ALERT_TYPE_COLOR, ALERT_TYPE_LABEL } from "@/types/agenda";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, isSameMonth, isSameDay, isToday, format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Users, FileText, FolderKanban, UserPlus,
  Siren, AlertTriangle, Info, BookOpen, Plus,
} from "lucide-react";
import { TaskFormModal } from "@/components/aluno/TaskFormModal";
import { AlertFormModal } from "@/components/aluno/AlertFormModal";
import { TaskDetailsDialog } from "@/components/aluno/TaskDetailsDialog";
import { AlertDetailsDialog } from "@/components/aluno/AlertDetailsDialog";
import { toast } from "sonner";

const AdminArea = () => {
  const { isAdmin, adminPassword } = useAuth();
  const [stats, setStats] = useState({ alunos: 0, lastSignup: "—" });
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [taskOpen, setTaskOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState(false);
  const [alertDetails, setAlertDetails] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { data: last } = await supabase.from("profiles").select("nome,created_at").order("created_at", { ascending: false }).limit(1);
      setStats({
        alunos: count ?? 0,
        lastSignup: last?.[0] ? `${last[0].nome} (${format(new Date(last[0].created_at), "dd/MM/yyyy")})` : "—",
      });
      if (adminPassword) {
        try {
          const [t, a] = await Promise.all([
            adminAction<{ data: TaskRow[] }>(adminPassword, { type: "list_broadcast_tasks" }),
            adminAction<{ data: AlertRow[] }>(adminPassword, { type: "list_broadcast_alerts" }),
          ]);
          setTasks(t.data ?? []);
          setAlerts(a.data ?? []);
        } catch { /* silencioso */ }
      }
    })();
  }, [isAdmin, adminPassword]);

  if (!isAdmin) return <Navigate to="/" replace />;

  // calendário
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 }),
  });
  const eventDays = new Set<string>();
  tasks.forEach((t) => eventDays.add(t.data_limite ?? t.data_criacao));
  alerts.forEach((a) => eventDays.add(a.data_criacao));

  const alertIcon = (t: AlertRow["tipo"]) => {
    switch (t) {
      case "URGENTE": return <Siren className="w-4 h-4 text-red-500" />;
      case "ATENCAO": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "INFORMACAO": return <Info className="w-4 h-4 text-blue-500" />;
      case "NOVO_MATERIAL": return <BookOpen className="w-4 h-4 text-purple-500" />;
    }
  };

  const submitTask = async (data: { titulo: string; descricao: string; data_criacao: string; data_limite: string | null }) => {
    if (!adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "create_broadcast_task", payload: { ...data, descricao: data.descricao || undefined } });
      toast.success("Tarefa criada!");
      const t = await adminAction<{ data: TaskRow[] }>(adminPassword, { type: "list_broadcast_tasks" });
      setTasks(t.data ?? []);
    } catch (e: any) { toast.error(e.message); }
  };

  const submitAlert = async (data: { titulo: string; mensagem: string; tipo: AlertRow["tipo"]; data_criacao: string }) => {
    if (!adminPassword) return;
    try {
      await adminAction(adminPassword, { type: "create_broadcast_alert", payload: data });
      toast.success("Alerta criado!");
      const a = await adminAction<{ data: AlertRow[] }>(adminPassword, { type: "list_broadcast_alerts" });
      setAlerts(a.data ?? []);
    } catch (e: any) { toast.error(e.message); }
  };

  const kpiCards = [
    { title: "Alunos cadastrados", value: stats.alunos, icon: Users },
    { title: "Posts publicados", value: "—", icon: FileText },
    { title: "Projetos publicados", value: "—", icon: FolderKanban },
    { title: "Último cadastro", value: stats.lastSignup, icon: UserPlus, small: true },
  ];

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl uppercase text-navy">Painel Administrativo</h1>
      <p className="font-body text-muted-foreground mt-1">Visão geral do site.</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {kpiCards.map((c, i) => (
          <div key={i} className="bg-card border-2 border-navy/10 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-ui text-xs uppercase text-muted-foreground">{c.title}</p>
              <c.icon className="w-4 h-4 text-pixelyellow" />
            </div>
            <p className={`font-display ${c.small ? "text-base" : "text-3xl"} text-navy mt-2 truncate`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* SUB-SEÇÃO 2: Atividade + Ações + Calendário */}
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-card border-2 border-navy/10 rounded-xl p-5">
          <h3 className="font-display text-lg uppercase text-navy mb-3">Atividade Recente</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between text-muted-foreground">
              <span>Painel iniciado</span>
              <span className="text-xs">{format(new Date(), "dd/MM HH:mm")}</span>
            </li>
            {tasks.slice(0, 3).map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <span className="truncate">📋 Tarefa: {t.titulo}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(t.created_at), "dd/MM")}</span>
              </li>
            ))}
            {alerts.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span className="truncate">🔔 Alerta: {a.titulo}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "dd/MM")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border-2 border-navy/10 rounded-xl p-5">
          <h3 className="font-display text-lg uppercase text-navy mb-3">Ações Rápidas</h3>
          <div className="space-y-2">
            <a href="/admin/alunos" className="block p-3 rounded-md bg-muted/50 hover:bg-pixelyellow hover:text-navy transition-all font-ui text-sm">
              👥 Gerenciar Alunos
            </a>
            <a href="/admin/blog" className="block p-3 rounded-md bg-muted/50 hover:bg-pixelyellow hover:text-navy transition-all font-ui text-sm">
              📝 Gerenciar Posts
            </a>
            <a href="/admin/projetos" className="block p-3 rounded-md bg-muted/50 hover:bg-pixelyellow hover:text-navy transition-all font-ui text-sm">
              📂 Gerenciar Projetos
            </a>
          </div>
        </div>

        <div className="bg-card border-2 border-navy/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg uppercase text-navy">Calendário</h3>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setCursor((c) => subMonths(c, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-ui text-xs uppercase min-w-[100px] text-center">
                {format(cursor, "MMM yyyy", { locale: ptBR })}
              </span>
              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setCursor((c) => addMonths(c, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={() => setCursor(new Date())} className="btn-pixel-yellow !py-1 !px-2 text-[10px]">HOJE</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} className="font-ui text-[9px] text-muted-foreground py-0.5">{d}</div>
            ))}
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const inMonth = isSameMonth(d, cursor);
              const today = isToday(d);
              const has = eventDays.has(key);
              return (
                <div key={key}
                  className={`relative aspect-square text-xs grid place-items-center rounded
                    ${inMonth ? "text-navy" : "text-muted-foreground/40"}
                    ${today ? "bg-pixelyellow text-navy font-bold" : ""}`}>
                  {format(d, "d")}
                  {has && !today && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pixelred" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-SEÇÃO 3: Alertas + Próximas Tarefas */}
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border-2 border-navy/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg uppercase text-navy">Alertas</h3>
            <Button onClick={() => setAlertOpen(true)} className="btn-pixel-yellow !py-1.5 !px-3 text-xs">
              <Plus className="w-4 h-4 mr-1" /> ALERTA
            </Button>
          </div>
          <ul className="space-y-2 max-h-72 overflow-auto">
            {alerts.length === 0 && <li className="text-sm text-muted-foreground text-center py-4">Nenhum alerta.</li>}
            {alerts.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-2 p-2 rounded bg-muted/40">
                {alertIcon(a.tipo)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-ui text-sm font-semibold truncate">{a.titulo}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold whitespace-nowrap ${ALERT_TYPE_COLOR[a.tipo]}`}>
                      {ALERT_TYPE_LABEL[a.tipo]}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{format(new Date(a.data_criacao), "dd/MM/yyyy")}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center mt-3">
            <Button variant="outline" onClick={() => setAlertDetails(true)}
              className="rounded-full border-pixelyellow text-navy hover:bg-pixelyellow">
              VER DETALHES DOS ALERTAS
            </Button>
          </div>
        </div>

        <div className="bg-card border-2 border-navy/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg uppercase text-navy">Próximas Tarefas</h3>
            <Button onClick={() => setTaskOpen(true)} className="btn-pixel-yellow !py-1.5 !px-3 text-xs">
              <Plus className="w-4 h-4 mr-1" /> TAREFA
            </Button>
          </div>
          <ul className="space-y-2 max-h-72 overflow-auto">
            {tasks.length === 0 && <li className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa.</li>}
            {tasks.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-2 p-2 rounded bg-muted/40">
                <input type="checkbox" disabled className="accent-pixelyellow" />
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-semibold truncate">{t.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Criado {format(new Date(t.data_criacao), "dd/MM")}
                    {t.data_limite && ` • Prazo ${format(new Date(t.data_limite), "dd/MM")}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center mt-3">
            <Button variant="outline" onClick={() => setTaskDetails(true)}
              className="rounded-full border-pixelyellow text-navy hover:bg-pixelyellow">
              VER DETALHES DAS TAREFAS
            </Button>
          </div>
        </div>
      </div>

      <TaskFormModal open={taskOpen} onOpenChange={setTaskOpen} onSubmit={submitTask} title="NOVA TAREFA" />
      <AlertFormModal open={alertOpen} onOpenChange={setAlertOpen} onSubmit={submitAlert} title="CRIAR NOVO ALERTA" />
      <TaskDetailsDialog open={taskDetails} onOpenChange={setTaskDetails} tasks={tasks} />
      <AlertDetailsDialog open={alertDetails} onOpenChange={setAlertDetails} alerts={alerts} />
    </AdminLayout>
  );
};

export default AdminArea;
