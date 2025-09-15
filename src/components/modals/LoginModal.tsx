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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempt:", { cpf, password, remember });
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
              />
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Primeira vez?</p>
                <p>• Usuários cadastrados: Use sua senha pessoal</p>
                <p>• Beneficiários FUNSEP: Use <span className="font-medium">matrícula + matrícula funcional</span></p>
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

          <Button type="submit" className="w-full gap-2">
            <LogIn className="h-4 w-4" />
            Entrar
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
                  <p className="font-medium text-foreground">🏢 Beneficiários FUNSEP (Primeira vez):</p>
                  <p className="text-muted-foreground">
                    Use seu CPF + senha: <span className="italic">matrícula + matrícula funcional</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Após o primeiro acesso, você definirá uma senha pessoal
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">👤 Usuários Cadastrados:</p>
                  <p className="text-muted-foreground">
                    Use seu CPF + senha pessoal definida anteriormente
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