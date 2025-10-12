import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function ExclusaoAssociadoForm({ formData, updateFormData }: FormProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Autoriza cobrança via boleto bancário de eventuais despesas pendentes. Necessário devolver carteira de sócio. Em caso de retorno, cumprirá novos prazos de carência.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Nome Completo *</Label>
        <Input 
          value={formData.nome} 
          onChange={(e) => updateFormData("nome", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Data *</Label>
        <Input 
          type="date" 
          value={formData.data || ""} 
          onChange={(e) => updateFormData("data", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Input 
          value={formData.observacoes || ""} 
          onChange={(e) => updateFormData("observacoes", e.target.value)} 
          placeholder="Devolução da carteira de sócio"
        />
      </div>
    </div>
  );
}
