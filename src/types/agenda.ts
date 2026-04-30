export type TaskRow = {
  id: string;
  owner_id: string;
  origin: "aluno" | "professora";
  is_broadcast: boolean;
  titulo: string;
  descricao: string | null;
  data_criacao: string;
  data_limite: string | null;
  concluida: boolean;
  created_at: string;
};

export type AlertRow = {
  id: string;
  owner_id: string;
  is_broadcast: boolean;
  titulo: string;
  mensagem: string;
  tipo: "URGENTE" | "ATENCAO" | "INFORMACAO" | "NOVO_MATERIAL";
  data_criacao: string;
  created_at: string;
};

export const ALERT_TYPE_LABEL: Record<AlertRow["tipo"], string> = {
  URGENTE: "URGENTE",
  ATENCAO: "ATENÇÃO",
  INFORMACAO: "INFORMAÇÃO IMPORTANTE",
  NOVO_MATERIAL: "NOVO MATERIAL",
};

export const ALERT_TYPE_COLOR: Record<AlertRow["tipo"], string> = {
  URGENTE: "bg-red-500/20 text-red-300 border-red-500/40",
  ATENCAO: "bg-yellow-500/20 text-yellow-200 border-yellow-500/40",
  INFORMACAO: "bg-blue-500/20 text-blue-200 border-blue-500/40",
  NOVO_MATERIAL: "bg-purple-500/20 text-purple-200 border-purple-500/40",
};
