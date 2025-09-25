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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          sigla: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          sigla: string
          token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          sigla?: string
          token?: string
        }
        Relationships: []
      }
      cadben: {
        Row: {
          agencia: string | null
          bairro: string | null
          banco: string | null
          cargo: number | null
          cartprof: string | null
          cep: number | null
          cidade: string | null
          codunimed: string | null
          complemento: string | null
          contacorr: string | null
          cpf: number | null
          datacadastro: string | null
          datamovimentacao: string | null
          ddd: string | null
          ddd1: string | null
          ddd2: string | null
          dtbaseecco: string | null
          dtbaseplano: string | null
          dtbasesit: string | null
          dtemirg: string | null
          dtnasc: string | null
          email: string | null
          empresa: number | null
          endereco: string | null
          estcivil: number | null
          faixaetaria: number | null
          formapgmen: number | null
          identidade: string | null
          limcrednissei: string | null
          localtrab: number | null
          matnoipe: string | null
          matrfunc: string | null
          matricula: number
          motcanc: number | null
          nome: string | null
          nomemae: string | null
          numero: string | null
          orgemi: string | null
          pispasep: string | null
          serie: string | null
          sexo: string | null
          siglacadastro: string | null
          siglamovimentacao: string | null
          sitdrogamed: string | null
          sitecco: string | null
          sitfarmaline: string | null
          sitgolden: string | null
          sitnissei: string | null
          situacao: number | null
          telefone: string | null
          telefone1: string | null
          telefone2: string | null
          tipacomoda: number | null
          tipofunc: string | null
          tipoplano: number | null
          uf: string | null
        }
        Insert: {
          agencia?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: number | null
          cartprof?: string | null
          cep?: number | null
          cidade?: string | null
          codunimed?: string | null
          complemento?: string | null
          contacorr?: string | null
          cpf?: number | null
          datacadastro?: string | null
          datamovimentacao?: string | null
          ddd?: string | null
          ddd1?: string | null
          ddd2?: string | null
          dtbaseecco?: string | null
          dtbaseplano?: string | null
          dtbasesit?: string | null
          dtemirg?: string | null
          dtnasc?: string | null
          email?: string | null
          empresa?: number | null
          endereco?: string | null
          estcivil?: number | null
          faixaetaria?: number | null
          formapgmen?: number | null
          identidade?: string | null
          limcrednissei?: string | null
          localtrab?: number | null
          matnoipe?: string | null
          matrfunc?: string | null
          matricula: number
          motcanc?: number | null
          nome?: string | null
          nomemae?: string | null
          numero?: string | null
          orgemi?: string | null
          pispasep?: string | null
          serie?: string | null
          sexo?: string | null
          siglacadastro?: string | null
          siglamovimentacao?: string | null
          sitdrogamed?: string | null
          sitecco?: string | null
          sitfarmaline?: string | null
          sitgolden?: string | null
          sitnissei?: string | null
          situacao?: number | null
          telefone?: string | null
          telefone1?: string | null
          telefone2?: string | null
          tipacomoda?: number | null
          tipofunc?: string | null
          tipoplano?: number | null
          uf?: string | null
        }
        Update: {
          agencia?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: number | null
          cartprof?: string | null
          cep?: number | null
          cidade?: string | null
          codunimed?: string | null
          complemento?: string | null
          contacorr?: string | null
          cpf?: number | null
          datacadastro?: string | null
          datamovimentacao?: string | null
          ddd?: string | null
          ddd1?: string | null
          ddd2?: string | null
          dtbaseecco?: string | null
          dtbaseplano?: string | null
          dtbasesit?: string | null
          dtemirg?: string | null
          dtnasc?: string | null
          email?: string | null
          empresa?: number | null
          endereco?: string | null
          estcivil?: number | null
          faixaetaria?: number | null
          formapgmen?: number | null
          identidade?: string | null
          limcrednissei?: string | null
          localtrab?: number | null
          matnoipe?: string | null
          matrfunc?: string | null
          matricula?: number
          motcanc?: number | null
          nome?: string | null
          nomemae?: string | null
          numero?: string | null
          orgemi?: string | null
          pispasep?: string | null
          serie?: string | null
          sexo?: string | null
          siglacadastro?: string | null
          siglamovimentacao?: string | null
          sitdrogamed?: string | null
          sitecco?: string | null
          sitfarmaline?: string | null
          sitgolden?: string | null
          sitnissei?: string | null
          situacao?: number | null
          telefone?: string | null
          telefone1?: string | null
          telefone2?: string | null
          tipacomoda?: number | null
          tipofunc?: string | null
          tipoplano?: number | null
          uf?: string | null
        }
        Relationships: []
      }
      caddep: {
        Row: {
          codunimed: string | null
          cpf: string | null
          datacadastro: string | null
          datamovimentacao: string | null
          dtbaseecco: string | null
          dtbasesit: string | null
          dtemirg: string | null
          dtnasc: string | null
          dtvalid: string | null
          email: string | null
          faixaetaria: number | null
          identidade: string | null
          matricula: number
          motcanc: number | null
          nome: string | null
          nomemae: string | null
          nrodep: number | null
          orgemi: string | null
          parent: number | null
          sexo: string | null
          siglacadastro: string | null
          siglamovimentacao: string | null
          sitecco: string | null
          sitgolden: string | null
          situacao: number | null
          tipacomoda: string | null
        }
        Insert: {
          codunimed?: string | null
          cpf?: string | null
          datacadastro?: string | null
          datamovimentacao?: string | null
          dtbaseecco?: string | null
          dtbasesit?: string | null
          dtemirg?: string | null
          dtnasc?: string | null
          dtvalid?: string | null
          email?: string | null
          faixaetaria?: number | null
          identidade?: string | null
          matricula: number
          motcanc?: number | null
          nome?: string | null
          nomemae?: string | null
          nrodep?: number | null
          orgemi?: string | null
          parent?: number | null
          sexo?: string | null
          siglacadastro?: string | null
          siglamovimentacao?: string | null
          sitecco?: string | null
          sitgolden?: string | null
          situacao?: number | null
          tipacomoda?: string | null
        }
        Update: {
          codunimed?: string | null
          cpf?: string | null
          datacadastro?: string | null
          datamovimentacao?: string | null
          dtbaseecco?: string | null
          dtbasesit?: string | null
          dtemirg?: string | null
          dtnasc?: string | null
          dtvalid?: string | null
          email?: string | null
          faixaetaria?: number | null
          identidade?: string | null
          matricula?: number
          motcanc?: number | null
          nome?: string | null
          nomemae?: string | null
          nrodep?: number | null
          orgemi?: string | null
          parent?: number | null
          sexo?: string | null
          siglacadastro?: string | null
          siglamovimentacao?: string | null
          sitecco?: string | null
          sitgolden?: string | null
          situacao?: number | null
          tipacomoda?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_caddep_parent_tabgrpar"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "tabgrpar"
            referencedColumns: ["codigo"]
          },
        ]
      }
      irpfd: {
        Row: {
          ano: number | null
          matricula: number | null
          nrodep: string | null
          vlguia: number | null
          vlmen: number | null
        }
        Insert: {
          ano?: number | null
          matricula?: number | null
          nrodep?: string | null
          vlguia?: number | null
          vlmen?: number | null
        }
        Update: {
          ano?: number | null
          matricula?: number | null
          nrodep?: string | null
          vlguia?: number | null
          vlmen?: number | null
        }
        Relationships: []
      }
      irpfdb: {
        Row: {
          ano: number | null
          matricula: number | null
          nrodep: string | null
          vlguia: number | null
          vlmen: number | null
        }
        Insert: {
          ano?: number | null
          matricula?: number | null
          nrodep?: string | null
          vlguia?: number | null
          vlmen?: number | null
        }
        Update: {
          ano?: number | null
          matricula?: number | null
          nrodep?: string | null
          vlguia?: number | null
          vlmen?: number | null
        }
        Relationships: []
      }
      irpft: {
        Row: {
          ano: number | null
          guiaboleto: string | null
          guiat: number | null
          matricula: number | null
          ment: number | null
          nrodep: string | null
          vlecco: string | null
        }
        Insert: {
          ano?: number | null
          guiaboleto?: string | null
          guiat?: number | null
          matricula?: number | null
          ment?: number | null
          nrodep?: string | null
          vlecco?: string | null
        }
        Update: {
          ano?: number | null
          guiaboleto?: string | null
          guiat?: number | null
          matricula?: number | null
          ment?: number | null
          nrodep?: string | null
          vlecco?: string | null
        }
        Relationships: []
      }
      irpftb: {
        Row: {
          ano: number | null
          guiaboleto: string | null
          guiat: number | null
          matricula: number | null
          ment: string | null
          nrodep: string | null
          vlecco: string | null
        }
        Insert: {
          ano?: number | null
          guiaboleto?: string | null
          guiat?: number | null
          matricula?: number | null
          ment?: string | null
          nrodep?: string | null
          vlecco?: string | null
        }
        Update: {
          ano?: number | null
          guiaboleto?: string | null
          guiat?: number | null
          matricula?: number | null
          ment?: string | null
          nrodep?: string | null
          vlecco?: string | null
        }
        Relationships: []
      }
      mgumrrapg: {
        Row: {
          datareceb: string | null
          datavenc: string | null
          dep: string | null
          dtatend: string | null
          evento: string | null
          forreceb: number | null
          guia: number | null
          matricula: number | null
          parcela: number | null
          prsv: number | null
          tipo: string | null
          tipreceb: number | null
          titulo: number | null
          valorpago: number | null
          valorpart: number | null
          valorreceb: string | null
          valortit: number | null
        }
        Insert: {
          datareceb?: string | null
          datavenc?: string | null
          dep?: string | null
          dtatend?: string | null
          evento?: string | null
          forreceb?: number | null
          guia?: number | null
          matricula?: number | null
          parcela?: number | null
          prsv?: number | null
          tipo?: string | null
          tipreceb?: number | null
          titulo?: number | null
          valorpago?: number | null
          valorpart?: number | null
          valorreceb?: string | null
          valortit?: number | null
        }
        Update: {
          datareceb?: string | null
          datavenc?: string | null
          dep?: string | null
          dtatend?: string | null
          evento?: string | null
          forreceb?: number | null
          guia?: number | null
          matricula?: number | null
          parcela?: number | null
          prsv?: number | null
          tipo?: string | null
          tipreceb?: number | null
          titulo?: number | null
          valorpago?: number | null
          valorpart?: number | null
          valorreceb?: string | null
          valortit?: number | null
        }
        Relationships: []
      }
      noticias: {
        Row: {
          autor_sigla: string
          categoria: string
          conteudo: string
          created_at: string
          data_publicacao: string | null
          id: string
          imagem_url: string | null
          publicado: boolean
          resumo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor_sigla: string
          categoria: string
          conteudo: string
          created_at?: string
          data_publicacao?: string | null
          id?: string
          imagem_url?: string | null
          publicado?: boolean
          resumo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor_sigla?: string
          categoria?: string
          conteudo?: string
          created_at?: string
          data_publicacao?: string | null
          id?: string
          imagem_url?: string | null
          publicado?: boolean
          resumo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      senhas: {
        Row: {
          cpf: string
          created_at: string
          created_by_sigla: string | null
          id: string
          matricula: number | null
          nome: string | null
          senha: string
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          created_by_sigla?: string | null
          id?: string
          matricula?: number | null
          nome?: string | null
          senha: string
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          created_by_sigla?: string | null
          id?: string
          matricula?: number | null
          nome?: string | null
          senha?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_senhas_matricula"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "cadben"
            referencedColumns: ["matricula"]
          },
        ]
      }
      tabbeneficios: {
        Row: {
          classe: string | null
          codigo: string | null
          id: number
          nome: string | null
          unidvlr: string | null
          vlrbenef: string | null
        }
        Insert: {
          classe?: string | null
          codigo?: string | null
          id?: number
          nome?: string | null
          unidvlr?: string | null
          vlrbenef?: string | null
        }
        Update: {
          classe?: string | null
          codigo?: string | null
          id?: number
          nome?: string | null
          unidvlr?: string | null
          vlrbenef?: string | null
        }
        Relationships: []
      }
      tabempresas: {
        Row: {
          codigo: number
          nome: string | null
        }
        Insert: {
          codigo: number
          nome?: string | null
        }
        Update: {
          codigo?: number
          nome?: string | null
        }
        Relationships: []
      }
      tabgrpar: {
        Row: {
          codigo: number
          nome: string | null
          tipo: string | null
        }
        Insert: {
          codigo: number
          nome?: string | null
          tipo?: string | null
        }
        Update: {
          codigo?: number
          nome?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          cargo: string | null
          cpf: string | null
          id: number
          nome: string | null
          secao: string
          senha: string | null
          sigla: string | null
          status: string | null
        }
        Insert: {
          cargo?: string | null
          cpf?: string | null
          id?: number
          nome?: string | null
          secao: string
          senha?: string | null
          sigla?: string | null
          status?: string | null
        }
        Update: {
          cargo?: string | null
          cpf?: string | null
          id?: number
          nome?: string | null
          secao?: string
          senha?: string | null
          sigla?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
