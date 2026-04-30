import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TaskRow } from "@/types/agenda";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { titulo: string; descricao: string; data_criacao: string; data_limite: string | null }) => Promise<void>;
  initial?: TaskRow | null;
  title?: string;
}

export const TaskFormModal = ({ open, onOpenChange, onSubmit, initial, title = "NOVA TAREFA" }: Props) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataCriacao, setDataCriacao] = useState(new Date().toISOString().slice(0, 10));
  const [dataLimite, setDataLimite] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo(initial?.titulo ?? "");
      setDescricao(initial?.descricao ?? "");
      setDataCriacao(initial?.data_criacao ?? new Date().toISOString().slice(0, 10));
      setDataLimite(initial?.data_limite ?? "");
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data_criacao: dataCriacao,
        data_limite: dataLimite || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[hsl(220_60%_10%)] border-2 border-pixelyellow text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-pixelyellow text-center">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="text-pixelyellow font-ui text-xs">TÍTULO *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              maxLength={200}
              className="bg-[hsl(220_60%_6%)] border-pixelyellow/40 text-white"
              placeholder="Nome da tarefa"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-pixelyellow font-ui text-xs">DESCRIÇÃO (opcional)</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={1000}
              rows={3}
              className="bg-[hsl(220_60%_6%)] border-pixelyellow/40 text-white"
              placeholder="Detalhes da tarefa"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-pixelyellow font-ui text-xs">DATA DE CRIAÇÃO</Label>
              <Input
                type="date"
                value={dataCriacao}
                onChange={(e) => setDataCriacao(e.target.value)}
                required
                className="bg-[hsl(220_60%_6%)] border-pixelyellow/40 text-white"
              />
            </div>
            <div>
              <Label className="text-pixelyellow font-ui text-xs">DATA LIMITE (opcional)</Label>
              <Input
                type="date"
                value={dataLimite}
                onChange={(e) => setDataLimite(e.target.value)}
                className="bg-[hsl(220_60%_6%)] border-pixelyellow/40 text-white"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              CANCELAR
            </Button>
            <Button type="submit" disabled={saving} className="btn-pixel-yellow">
              {saving ? "SALVANDO..." : "SALVAR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
