export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_reads: {
        Row: {
          alert_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          alert_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          alert_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_reads_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          data_criacao: string
          id: string
          is_broadcast: boolean
          mensagem: string
          owner_id: string
          tipo: Database["public"]["Enums"]["alert_type"]
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_criacao?: string
          id?: string
          is_broadcast?: boolean
          mensagem: string
          owner_id: string
          tipo?: Database["public"]["Enums"]["alert_type"]
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_criacao?: string
          id?: string
          is_broadcast?: boolean
          mensagem?: string
          owner_id?: string
          tipo?: Database["public"]["Enums"]["alert_type"]
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      conquistas: {
        Row: {
          codigo: string
          created_at: string
          descricao: string
          icone: string
          id: string
          titulo: string
          xp_recompensa: number
        }
        Insert: {
          codigo: string
          created_at?: string
          descricao: string
          icone?: string
          id?: string
          titulo: string
          xp_recompensa?: number
        }
        Update: {
          codigo?: string
          created_at?: string
          descricao?: string
          icone?: string
          id?: string
          titulo?: string
          xp_recompensa?: number
        }
        Relationships: []
      }
      materiais: {
        Row: {
          arquivo_path: string | null
          arquivo_tipo: string | null
          arquivo_url: string | null
          capa_url: string | null
          created_at: string
          created_by: string
          data_publicacao: string | null
          descricao: string | null
          id: string
          integrantes: string[] | null
          ordem: number
          tipo: Database["public"]["Enums"]["material_tipo"]
          titulo: string
          trimestre: number | null
          updated_at: string
          visivel_publico: boolean
        }
        Insert: {
          arquivo_path?: string | null
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          capa_url?: string | null
          created_at?: string
          created_by: string
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          integrantes?: string[] | null
          ordem?: number
          tipo: Database["public"]["Enums"]["material_tipo"]
          titulo: string
          trimestre?: number | null
          updated_at?: string
          visivel_publico?: boolean
        }
        Update: {
          arquivo_path?: string | null
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          capa_url?: string | null
          created_at?: string
          created_by?: string
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          integrantes?: string[] | null
          ordem?: number
          tipo?: Database["public"]["Enums"]["material_tipo"]
          titulo?: string
          trimestre?: number | null
          updated_at?: string
          visivel_publico?: boolean
        }
        Relationships: []
      }
      material_views: {
        Row: {
          id: string
          material_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          material_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          material_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_views_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string | null
          author_nome: string | null
          conteudo: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id?: string | null
          author_nome?: string | null
          conteudo: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string | null
          author_nome?: string | null
          conteudo?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          capa_url: string | null
          conteudo: string
          created_at: string
          id: string
          justificativa_reprovacao: string | null
          published_at: string | null
          resumo: string | null
          status: Database["public"]["Enums"]["post_status"]
          tags: string[]
          titulo: string
          updated_at: string
          visualizacoes: number
        }
        Insert: {
          author_id: string
          capa_url?: string | null
          conteudo?: string
          created_at?: string
          id?: string
          justificativa_reprovacao?: string | null
          published_at?: string | null
          resumo?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          titulo: string
          updated_at?: string
          visualizacoes?: number
        }
        Update: {
          author_id?: string
          capa_url?: string | null
          conteudo?: string
          created_at?: string
          id?: string
          justificativa_reprovacao?: string | null
          published_at?: string | null
          resumo?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          titulo?: string
          updated_at?: string
          visualizacoes?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          classe: string
          created_at: string
          id: string
          nivel: number
          nome: string
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          classe?: string
          created_at?: string
          id: string
          nivel?: number
          nome: string
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          classe?: string
          created_at?: string
          id?: string
          nivel?: number
          nome?: string
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          blocos: Json
          html_override: string | null
          id: string
          slug: string
          titulo: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          blocos?: Json
          html_override?: string | null
          id?: string
          slug: string
          titulo?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          blocos?: Json
          html_override?: string | null
          id?: string
          slug?: string
          titulo?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          concluida: boolean
          created_at: string
          data_criacao: string
          data_limite: string | null
          descricao: string | null
          id: string
          is_broadcast: boolean
          origin: Database["public"]["Enums"]["task_origin"]
          owner_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_criacao?: string
          data_limite?: string | null
          descricao?: string | null
          id?: string
          is_broadcast?: boolean
          origin?: Database["public"]["Enums"]["task_origin"]
          owner_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_criacao?: string
          data_limite?: string | null
          descricao?: string | null
          id?: string
          is_broadcast?: boolean
          origin?: Database["public"]["Enums"]["task_origin"]
          owner_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_conquistas: {
        Row: {
          conquista_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          conquista_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          conquista_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conquistas_conquista_id_fkey"
            columns: ["conquista_id"]
            isOneToOne: false
            referencedRelation: "conquistas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ranking_alunos: {
        Row: {
          avatar_url: string | null
          classe: string | null
          id: string | null
          nivel: number | null
          nome: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          classe?: string | null
          id?: string | null
          nivel?: number | null
          nome?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          classe?: string | null
          id?: string | null
          nivel?: number | null
          nome?: string | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_xp: {
        Args: { _amount: number; _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      unlock_conquista: {
        Args: { _codigo: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      alert_type: "URGENTE" | "ATENCAO" | "INFORMACAO" | "NOVO_MATERIAL"
      app_role: "admin" | "aluno"
      material_tipo: "apostila" | "material_extra" | "projeto"
      post_status: "rascunho" | "aguardando" | "publicado" | "reprovado"
      task_origin: "aluno" | "professora"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: ["URGENTE", "ATENCAO", "INFORMACAO", "NOVO_MATERIAL"],
      app_role: ["admin", "aluno"],
      material_tipo: ["apostila", "material_extra", "projeto"],
      post_status: ["rascunho", "aguardando", "publicado", "reprovado"],
      task_origin: ["aluno", "professora"],
    },
  },
} as const
