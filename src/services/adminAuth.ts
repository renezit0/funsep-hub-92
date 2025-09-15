import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface AdminUser {
  sigla: string;
  nome: string;
  cargo: string;
  secao: string;
  status?: string;
}

export interface AdminSession {
  token: string;
  sigla: string;
  expires_at: string;
  user: AdminUser;
}

class AdminAuthService {
  private sessionKey = 'admin_session';

  async login(sigla: string, senha: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
      console.log('Tentando login com:', { sigla: sigla.toUpperCase(), senha });
      
      // Verificar credenciais na tabela usuarios
      const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('sigla', sigla.toUpperCase())
        .eq('senha', senha);

      console.log('Resultado da consulta:', { users, userError });

      if (userError) {
        console.error('Erro na consulta:', userError);
        return { success: false, error: 'Erro na consulta: ' + userError.message };
      }

      if (!users || users.length === 0) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const user = users[0];

      // Gerar token de sessão
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Criar sessão no banco
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          sigla,
          token,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (sessionError) {
        return { success: false, error: 'Erro ao criar sessão' };
      }

      const session: AdminSession = {
        token,
        sigla,
        expires_at: expiresAt.toISOString(),
        user: {
          sigla: user.sigla,
          nome: user.nome,
          cargo: user.cargo,
          secao: user.secao
        }
      };

      // Salvar sessão no localStorage
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      
      return { success: true, session };
    } catch (error) {
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async logout(): Promise<void> {
    const session = this.getSession();
    if (session) {
      // Desativar sessão no banco
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('token', session.token);
    }
    
    localStorage.removeItem(this.sessionKey);
  }

  getSession(): AdminSession | null {
    const sessionStr = localStorage.getItem(this.sessionKey);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      
      // Verificar se a sessão não expirou
      if (new Date(session.expires_at) < new Date()) {
        this.logout();
        return null;
      }
      
      return session;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  async validateSession(): Promise<boolean> {
    const session = this.getSession();
    if (!session) return false;

    try {
      // Verificar se a sessão ainda está ativa no banco
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('token', session.token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        this.logout();
        return false;
      }

      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}

export const adminAuth = new AdminAuthService();