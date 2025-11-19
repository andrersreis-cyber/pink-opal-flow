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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: number
          created_at: string
          data: string
          duracao_minutos: number
          id: number
          observacoes: string | null
          preco: number
          servico_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cliente_id: number
          created_at?: string
          data: string
          duracao_minutos: number
          id?: number
          observacoes?: string | null
          preco: number
          servico_id: string
          status: string
          updated_at?: string
        }
        Update: {
          cliente_id?: number
          created_at?: string
          data?: string
          duracao_minutos?: number
          id?: number
          observacoes?: string | null
          preco?: number
          servico_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_agendamentos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_followup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_top_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "vw_agendamentos_completos"
            referencedColumns: ["servico_id"]
          },
        ]
      }
      atividades_dashboard: {
        Row: {
          agendamento_id: number | null
          cliente_id: number | null
          created_at: string
          descricao: string
          id: number
          tipo: string
        }
        Insert: {
          agendamento_id?: number | null
          cliente_id?: number | null
          created_at?: string
          descricao: string
          id?: number
          tipo: string
        }
        Update: {
          agendamento_id?: number | null
          cliente_id?: number | null
          created_at?: string
          descricao?: string
          id?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_dashboard_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_dashboard_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "vw_agendamentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_dashboard_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_dashboard_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_agendamentos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "atividades_dashboard_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_followup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_dashboard_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_dashboard_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_top_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          active: boolean | null
          bot_message: string | null
          created_at: string | null
          id: number
          message_type: string | null
          nomewpp: string | null
          phone: string | null
          user_message: string | null
        }
        Insert: {
          active?: boolean | null
          bot_message?: string | null
          created_at?: string | null
          id?: number
          message_type?: string | null
          nomewpp?: string | null
          phone?: string | null
          user_message?: string | null
        }
        Update: {
          active?: boolean | null
          bot_message?: string | null
          created_at?: string | null
          id?: number
          message_type?: string | null
          nomewpp?: string | null
          phone?: string | null
          user_message?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string | null
          etapa_followup: number | null
          id: number
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          etapa_followup?: number | null
          id?: number
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          etapa_followup?: number | null
          id?: number
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          id: number
          nome: string
          observacoes: string | null
          proximo_atendimento: string | null
          servico_favorito: string | null
          telefone: string
          total_visitas: number
          ultimo_atendimento: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          nome: string
          observacoes?: string | null
          proximo_atendimento?: string | null
          servico_favorito?: string | null
          telefone: string
          total_visitas?: number
          ultimo_atendimento?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          nome?: string
          observacoes?: string | null
          proximo_atendimento?: string | null
          servico_favorito?: string | null
          telefone?: string
          total_visitas?: number
          ultimo_atendimento?: string | null
        }
        Relationships: []
      }
      dados_cliente: {
        Row: {
          atendimento_ia: string | null
          created_at: string | null
          id: number
          nomewpp: string | null
          telefone: string | null
        }
        Insert: {
          atendimento_ia?: string | null
          created_at?: string | null
          id?: number
          nomewpp?: string | null
          telefone?: string | null
        }
        Update: {
          atendimento_ia?: string | null
          created_at?: string | null
          id?: number
          nomewpp?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      historico_conversas: {
        Row: {
          cliente_id: number
          created_at: string
          id: number
          mensagem: string | null
          tipo: string
        }
        Insert: {
          cliente_id: number
          created_at?: string
          id?: number
          mensagem?: string | null
          tipo: string
        }
        Update: {
          cliente_id?: number
          created_at?: string
          id?: number
          mensagem?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_agendamentos_completos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "historico_conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_followup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_top_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_sistema: {
        Row: {
          conteudo: Json
          created_at: string
          id: number
          nivel: string | null
          origem: string
        }
        Insert: {
          conteudo: Json
          created_at?: string
          id?: number
          nivel?: string | null
          origem: string
        }
        Update: {
          conteudo?: Json
          created_at?: string
          id?: number
          nivel?: string | null
          origem?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      operacoes_agendamento: {
        Row: {
          acao: string
          agendamento_id: number | null
          created_at: string
          detalhes: Json | null
          id: number
        }
        Insert: {
          acao: string
          agendamento_id?: number | null
          created_at?: string
          detalhes?: Json | null
          id?: number
        }
        Update: {
          acao?: string
          agendamento_id?: number | null
          created_at?: string
          detalhes?: Json | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "operacoes_agendamento_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operacoes_agendamento_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "vw_agendamentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          descricao?: string | null
          duracao_minutos: number
          id: string
          nome: string
          preco: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
    }
    Views: {
      vw_agendamentos_completos: {
        Row: {
          cliente_id: number | null
          cliente_nome: string | null
          cliente_telefone: string | null
          created_at: string | null
          data: string | null
          data_fim: string | null
          duracao_minutos: number | null
          id: number | null
          observacoes: string | null
          preco: number | null
          servico_categoria: string | null
          servico_id: string | null
          servico_nome: string | null
          status: string | null
          time: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      vw_clientes_followup: {
        Row: {
          etapa_atual: string | null
          etapa_followup: number | null
          id: number | null
          nome: string | null
          telefone: string | null
        }
        Relationships: []
      }
      vw_clientes_unified: {
        Row: {
          atendimento_ia_status: string | null
          created_at: string | null
          etapa_followup: number | null
          id: number | null
          instance_id: string | null
          nome: string | null
          nome_whatsapp: string | null
          telefone: string | null
          ultimo_contato: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      vw_conversas: {
        Row: {
          cliente_id: number | null
          cliente_nome: string | null
          created_at: string | null
          direcao: string | null
          id: number | null
          mensagem_bot: string | null
          mensagem_usuario: string | null
          telefone: string | null
          tipo: string | null
        }
        Relationships: []
      }
      vw_conversas_formatadas: {
        Row: {
          client_id: string | null
          client_name: string | null
          id: string | null
          last_message: string | null
          last_message_date: string | null
          messages: Json | null
          phone: string | null
          status: string | null
        }
        Relationships: []
      }
      vw_estatisticas_dia: {
        Row: {
          cancelados: number | null
          confirmados: number | null
          dia: string | null
          minutos_ocupados: number | null
          pendentes: number | null
          receita_prevista: number | null
          receita_realizada: number | null
          total_agendamentos: number | null
        }
        Relationships: []
      }
      vw_top_clientes: {
        Row: {
          agendamentos_futuros: number | null
          id: number | null
          nome: string | null
          proximo_atendimento: string | null
          servico_favorito: string | null
          telefone: string | null
          total_gasto: number | null
          total_visitas: number | null
          ultimo_atendimento: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      buscar_servico_flexivel: {
        Args: { termo_busca: string }
        Returns: {
          ativo: boolean
          categoria: string
          descricao: string
          duracao_minutos: number
          id: string
          nome: string
          preco: number
          relevancia: number
        }[]
      }
      buscar_servicos_disponiveis: {
        Args: { termo_busca?: string }
        Returns: {
          ativo: boolean
          categoria: string
          descricao: string
          duracao_minutos: number
          id: string
          nome: string
          preco: number
        }[]
      }
      cancelar_agendamento: {
        Args: { p_agendamento_id: number }
        Returns: {
          mensagem: string
          sucesso: boolean
        }[]
      }
      criar_agendamento_validado: {
        Args: {
          p_cliente_id: number
          p_data: string
          p_observacoes?: string
          p_servico_id: string
        }
        Returns: {
          agendamento_id: number
          erro: string
          sucesso: boolean
        }[]
      }
      formatar_telefone_whatsapp: {
        Args: { telefone_text: string }
        Returns: string
      }
      listar_agendamentos_por_telefone: {
        Args: { p_telefone: string }
        Returns: {
          cliente_id: number
          data: string
          duracao_minutos: number
          id: number
          preco: number
          servico_categoria: string
          servico_id: string
          servico_nome: string
          status: string
        }[]
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      normalizar_telefone: { Args: { telefone_text: string }; Returns: string }
      normalizar_telefone_busca: {
        Args: { p_telefone: string }
        Returns: string
      }
      normalizar_telefone_insercao: {
        Args: { telefone_text: string }
        Returns: string
      }
      obter_cliente_id_por_telefone: {
        Args: { p_telefone: string }
        Returns: {
          id: number
          nome: string
          telefone: string
        }[]
      }
      remarcar_agendamento: {
        Args: { p_agendamento_id: number; p_nova_data: string }
        Returns: {
          agendamento_id: number
          erro: string
          sucesso: boolean
        }[]
      }
      upsert_cliente_completo: {
        Args: { p_nome: string; p_telefone: string }
        Returns: {
          atendimento_ia_status: string
          etapa_followup: number
          id: number
          nome: string
          telefone: string
        }[]
      }
      verificar_disponibilidade: {
        Args: { p_data_fim: string; p_data_inicio: string }
        Returns: {
          conflitos: Json
          disponivel: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
