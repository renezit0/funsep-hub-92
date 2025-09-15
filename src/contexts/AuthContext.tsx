import React, { createContext, useContext, useEffect, useState } from "react";
import { adminAuth, AdminSession } from "@/services/adminAuth";

interface AuthContextType {
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (sigla: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const currentSession = adminAuth.getSession();
      if (currentSession) {
        const isValid = await adminAuth.validateSession();
        if (isValid) {
          setSession(currentSession);
        } else {
          setSession(null);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (sigla: string, senha: string) => {
    const result = await adminAuth.login(sigla, senha);
    if (result.success && result.session) {
      setSession(result.session);
    }
    return result;
  };

  const logout = async () => {
    await adminAuth.logout();
    setSession(null);
  };

  const value = {
    session,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}