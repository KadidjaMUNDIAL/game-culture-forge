import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export const AdminPasswordModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { setAdmin } = useAuth();
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin", {
        body: { password: senha },
      });
      if (error) throw error;
      if (data?.valid) {
        setAdmin(true);
        toast.success("Acesso liberado.");
        setSenha("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error("Senha incorreta.");
      }
    } catch {
      toast.error("Erro ao validar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-2 border-pixelred">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-navy flex items-center gap-2">
            <Lock className="w-6 h-6 text-pixelred" /> Senha
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Digite a senha de administrador</Label>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
          </div>
          <Button type="submit" disabled={loading} className="btn-pixel-yellow w-full">
            {loading ? "Verificando..." : "ACESSAR"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
