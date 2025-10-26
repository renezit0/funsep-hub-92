import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface AdminUser {
  sigla: string;
  nome: string;
  cargo: string;
  secao: string;
  status?: string;
  matricula?: number;
}

export interface AdminSession {
  token: string;
  sigla: string;
  expires_at: string;
  user: AdminUser;
}

class AdminAuthService {
  private sessionKey = 'admin_session';

  async login(cpf: string, senha: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
      console.log('Tentando login com CPF:', { cpf });
      
      // Usar edge function segura para autenticação
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { cpf, senha }
      });

      if (error) {
        console.error('Erro no login:', error);
        return { success: false, error: 'Erro na autenticação' };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'CPF ou senha inválidos' };
      }

      // Salvar sessão retornada
      const session = data.session;
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      
      return { success: true, session };
    } catch (error) {
      console.error('Erro no login:', error);
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