import React, { useState } from "react";
import { LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminAuth } from "@/services/adminAuth";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [sigla, setSigla] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await adminAuth.login(sigla, senha);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao painel administrativo!",
        });
        onSuccess();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: result.error || "Credenciais inválidas",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro interno do servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Acesso Administrativo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sigla">Sigla</Label>
              <Input
                id="sigla"
                type="text"
                placeholder="Digite sua sigla"
                value={sigla}
                onChange={(e) => setSigla(e.target.value.toUpperCase())}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            <LogIn className="h-4 w-4" />
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Acesso restrito a administradores do sistema</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}