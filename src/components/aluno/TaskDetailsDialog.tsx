import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskRow } from "@/types/agenda";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tasks: TaskRow[];
}

export const TaskDetailsDialog = ({ open, onOpenChange, tasks }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl bg-[hsl(220_60%_10%)] border-2 border-pixelyellow text-white">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl uppercase text-pixelyellow">
          Detalhes das Tarefas
        </DialogTitle>
      </DialogHeader>
      <div className="overflow-auto max-h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow className="border-pixelyellow/30 hover:bg-transparent">
              <TableHead className="text-pixelyellow">TÍTULO</TableHead>
              <TableHead className="text-pixelyellow">DESCRIÇÃO</TableHead>
              <TableHead className="text-pixelyellow">CRIAÇÃO</TableHead>
              <TableHead className="text-pixelyellow">LIMITE</TableHead>
              <TableHead className="text-pixelyellow">ORIGEM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white/60 py-6">
                  Nenhuma tarefa cadastrada.
                </TableCell>
              </TableRow>
            ) : tasks.map((t) => (
              <TableRow key={t.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-semibold">{t.titulo}</TableCell>
                <TableCell className="text-white/80">{t.descricao || "—"}</TableCell>
                <TableCell>{format(new Date(t.data_criacao), "dd/MM/yyyy")}</TableCell>
                <TableCell>{t.data_limite ? format(new Date(t.data_limite), "dd/MM/yyyy") : "—"}</TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    t.origin === "professora" ? "bg-pixelyellow text-navy" : "bg-blue-500/30 text-blue-200"
                  }`}>
                    {t.origin === "professora" ? "PROFESSORA" : "ALUNO"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
);
