import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { AlertRow, ALERT_TYPE_LABEL } from "@/types/agenda";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  alerts: AlertRow[];
  ownUserId?: string;
  onEdit?: (a: AlertRow) => void;
}

export const AlertDetailsDialog = ({ open, onOpenChange, alerts, ownUserId, onEdit }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl bg-[hsl(220_60%_10%)] border-2 border-pixelyellow text-white">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl uppercase text-pixelyellow">
          Detalhes dos Alertas
        </DialogTitle>
      </DialogHeader>
      <div className="overflow-auto max-h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow className="border-pixelyellow/30 hover:bg-transparent">
              <TableHead className="text-pixelyellow">TÍTULO</TableHead>
              <TableHead className="text-pixelyellow">MENSAGEM</TableHead>
              <TableHead className="text-pixelyellow">CRIAÇÃO</TableHead>
              <TableHead className="text-pixelyellow">TIPO</TableHead>
              <TableHead className="text-pixelyellow w-20">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white/60 py-6">
                  Nenhum alerta cadastrado.
                </TableCell>
              </TableRow>
            ) : alerts.map((a) => {
              const canEdit = ownUserId && a.owner_id === ownUserId && !a.is_broadcast;
              return (
                <TableRow key={a.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-semibold">{a.titulo}</TableCell>
                  <TableCell className="text-white/80">{a.mensagem}</TableCell>
                  <TableCell>{format(new Date(a.data_criacao), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{ALERT_TYPE_LABEL[a.tipo]}</TableCell>
                  <TableCell>
                    {canEdit && onEdit && (
                      <Button size="icon" variant="ghost" onClick={() => onEdit(a)}
                        className="h-7 w-7 text-pixelyellow hover:bg-pixelyellow/20">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
);
