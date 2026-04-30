import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export const LoginAlunoModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  // login
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");

  // cadastro
  const [cNome, setCNome] = useState("");
  const [cClasse, setCClasse] = useState("3ª série");
  const [cSenha, setCSenha] = useState("");
  const [cConfirm, setCConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !senha) return toast.error("Preencha nome e senha.");
    setLoading(true);
    const { error } = await signIn(nome, senha);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Bem-vindo(a) de volta!");
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cNome.trim() || !cSenha) return toast.error("Preencha todos os campos.");
    if (cSenha.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (cSenha !== cConfirm) return toast.error("As senhas não coincidem.");
    setLoading(true);
    const { error } = await signUp(cNome, cClasse, cSenha);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Cadastro realizado! Você já pode entrar.");
    setCNome(""); setCSenha(""); setCConfirm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-pixelyellow">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-navy">Área do Aluno</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 font-ui">
            <TabsTrigger value="login">LOGIN</TabsTrigger>
            <TabsTrigger value="cadastro">CADASTRO</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-2">
              <div>
                <Label>Nome do Aluno</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Maria Silva" />
              </div>
              <div>
                <Label>Senha</Label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="btn-pixel-yellow w-full">
                {loading ? "Entrando..." : "ENTRAR"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="cadastro">
            <form onSubmit={handleCadastro} className="space-y-4 mt-2">
              <div>
                <Label>Nome do Aluno</Label>
                <Input value={cNome} onChange={(e) => setCNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <Label>Classe</Label>
                <Select value={cClasse} onValueChange={setCClasse}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3ª série">3ª série</SelectItem>
                    <SelectItem value="Pedagógico">Pedagógico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Crie uma Senha</Label>
                <Input type="password" value={cSenha} onChange={(e) => setCSenha(e.target.value)} />
              </div>
              <div>
                <Label>Confirme sua Senha</Label>
                <Input type="password" value={cConfirm} onChange={(e) => setCConfirm(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="btn-pixel-yellow w-full">
                {loading ? "Cadastrando..." : "CADASTRAR"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
