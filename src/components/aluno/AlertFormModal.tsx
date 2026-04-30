import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertRow, ALERT_TYPE_LABEL } from "@/types/agenda";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { titulo: string; mensagem: string; tipo: AlertRow["tipo"]; data_criacao: string }) => Promise<void>;
  initial?: AlertRow | null;
  title?: string;
}

export const AlertFormModal = ({ open, onOpenChange, onSubmit, initial, title = "CRIAR NOVO ALERTA" }: Props) => {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState<AlertRow["tipo"]>("INFORMACAO");
  const [dataCriacao, setDataCriacao] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo(initial?.titulo ?? "");
      setMensagem(initial?.mensagem ?? "");
      setTipo(initial?.tipo ?? "INFORMACAO");
      setDataCriacao(initial?.data_criacao ?? new Date().toISOString().slice(0, 10));
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ titulo: titulo.trim(), mensagem: mensagem.trim(), tipo, data_criacao: dataCriacao });
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
              autoFocus
            />
          </div>
          <div>
            <Label className="text-pixelyellow font-ui text-xs">MENSAGEM *</Label>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              required
              maxLength={1000}
              rows={3}
              className="bg-[hsl(220_60%_6%)] border-pixelyellow/40 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-pixelyellow font-ui text-xs">TIPO DE ALERTA</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as AlertRow["tipo"])}>
                <SelectTrigger className="bg-[hsl(220_60%_6%)] border-pixelyellow/40 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(220_60%_10%)] text-white border-pixelyellow/40">
                  {(Object.keys(ALERT_TYPE_LABEL) as AlertRow["tipo"][]).map((k) => (
                    <SelectItem key={k} value={k} className="focus:bg-pixelyellow focus:text-navy">
                      {ALERT_TYPE_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
