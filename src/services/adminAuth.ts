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

  async login(cpf: string, senha: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
      console.log('Tentando login com CPF:', { cpf, senha });
      
      // Primeiro, verificar se é admin (CPF existe na tabela usuarios)
      const { data: adminUsers, error: adminError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha);

      if (adminError) {
        console.error('Erro na consulta admin:', adminError);
        return { success: false, error: 'Erro na consulta: ' + adminError.message };
      }

      if (adminUsers && adminUsers.length > 0) {
        // É um admin
        const user = adminUsers[0];
        return await this.createSession(user.sigla, {
          sigla: user.sigla,
          nome: user.nome,
          cargo: user.cargo,
          secao: user.secao
        });
      }

      // Se não é admin, verificar na tabela senhas
      const { data: senhaData, error: senhaError } = await supabase
        .from('senhas')
        .select('*')
        .eq('cpf', cpf)
        .eq('senha', senha);

      if (senhaError) {
        console.error('Erro na consulta senha:', senhaError);
        return { success: false, error: 'Erro na consulta: ' + senhaError.message };
      }

      if (!senhaData || senhaData.length === 0) {
        return { success: false, error: 'CPF ou senha inválidos' };
      }

      const senhaRecord = senhaData[0];
      
      // Buscar dados do beneficiário na tabela cadben
      const { data: beneficiario, error: benError } = await supabase
        .from('cadben')
        .select('*')
        .eq('matricula', senhaRecord.matricula);

      if (benError || !beneficiario || beneficiario.length === 0) {
        return { success: false, error: 'Dados do beneficiário não encontrados' };
      }

      const user = beneficiario[0];
      
      return await this.createSession(`BEN-${user.matricula}`, {
        sigla: `BEN-${user.matricula}`,
        nome: user.nome || senhaRecord.nome,
        cargo: 'ASSOCIADO FUNSEP',
        secao: 'ASSOCIADOS FUNSEP'
      });
    } catch (error) {
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  private async createSession(sigla: string, userData: AdminUser) {
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
      user: userData
    };

    // Salvar sessão no localStorage
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    
    return { success: true, session };
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