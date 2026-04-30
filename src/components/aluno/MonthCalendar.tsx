import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskRow } from "@/types/agenda";

interface Props {
  tasks: TaskRow[];
}

export const MonthCalendar = ({ tasks }: Props) => {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    tasks.forEach((t) => {
      const key = t.data_limite ?? t.data_criacao;
      if (!key) return;
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    });
    return map;
  }, [tasks]);

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedTasks = selectedKey ? tasksByDay.get(selectedKey) ?? [] : [];

  return (
    <div className="rounded-xl p-5 bg-[hsl(220_60%_12%)] border-2 border-pixelyellow/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl uppercase text-pixelyellow flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> Calendário
        </h3>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setCursor((c) => subMonths(c, 1))}
            className="h-8 w-8 border-pixelyellow/40 text-white hover:bg-pixelyellow hover:text-navy">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-ui text-sm uppercase text-white min-w-[140px] text-center">
            {format(cursor, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button size="icon" variant="outline" onClick={() => setCursor((c) => addMonths(c, 1))}
            className="h-8 w-8 border-pixelyellow/40 text-white hover:bg-pixelyellow hover:text-navy">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => { setCursor(new Date()); setSelected(new Date()); }}
            className="btn-pixel-yellow !py-1 !px-3 text-xs">
            HOJE
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
          <div key={d} className="font-ui text-[10px] uppercase text-pixelyellow/80 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = isSameMonth(d, cursor);
          const today = isToday(d);
          const isSel = selected && isSameDay(d, selected);
          const key = format(d, "yyyy-MM-dd");
          const hasEvent = tasksByDay.has(key);

          return (
            <button
              key={key}
              onClick={() => setSelected(d)}
              className={`relative aspect-square rounded-md text-sm font-ui transition-all
                ${inMonth ? "text-white" : "text-white/30"}
                ${isSel ? "bg-pixelyellow text-navy font-bold shadow-[0_0_12px_hsl(var(--yellow)/0.6)]" : "hover:bg-white/10"}
                ${today && !isSel ? "ring-2 ring-pixelyellow" : ""}
              `}
            >
              {format(d, "d")}
              {hasEvent && !isSel && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 rounded-lg bg-[hsl(220_70%_8%)] border border-pixelyellow/40 p-4 animate-fade-in">
          <p className="font-ui text-xs uppercase text-pixelyellow/80 mb-2">
            {format(selected, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          {selectedTasks.length === 0 ? (
            <p className="font-body text-sm text-white/60">Sem eventos neste dia.</p>
          ) : (
            <ul className="space-y-2">
              {selectedTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-2">
                  <CalendarIcon className="w-4 h-4 text-pixelred shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-ui text-sm text-white font-semibold">{t.titulo}</p>
                      {t.data_limite === selectedKey && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-pixelred text-white font-bold">
                          PRAZO
                        </span>
                      )}
                      {t.is_broadcast && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-pixelyellow text-navy font-bold">
                          PROFESSORA
                        </span>
                      )}
                    </div>
                    {t.descricao && (
                      <p className="font-body text-xs text-white/70 mt-0.5">{t.descricao}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
