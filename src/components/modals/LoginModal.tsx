import { useState } from "react";
import { X, LogIn, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanCpf = cpf.replace(/\D/g, "");
      const result = await login(cleanCpf, password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema!",
        });
        onSuccess?.();
        onClose();
        setCpf("");
        setPassword("");
      } else {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: result.error || "CPF ou senha inválidos",
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

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Área do Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                maxLength={14}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Primeira vez?</p>
                <p>• Usuários cadastrados: Use sua senha pessoal</p>
                <p>• Associado FUNSEP: Use <span className="font-medium">matrícula + matrícula funcional</span></p>
                <p className="italic">Exemplo: se matrícula=4163 e mat.funcional=3794, use: 41633794</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm">
              Lembrar-me
            </Label>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            <LogIn className="h-4 w-4" />
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          {/* Login Information Card */}
          <Card className="bg-bg-secondary">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Info className="h-4 w-4 text-info" />
                Como Acessar
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-foreground">👤 Administradores:</p>
                  <p className="text-muted-foreground">
                    Use seu CPF cadastrado + senha administrativa
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">🏢 Beneficiários FUNSEP:</p>
                  <p className="text-muted-foreground">
                    Use seu CPF + senha cadastrada no sistema
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Procure um administrador para cadastrar sua senha de acesso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}