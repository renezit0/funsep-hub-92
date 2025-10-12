import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RequestDocumentUpload } from "@/components/RequestDocumentUpload";

interface FormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  handleDocumentUpload: (docType: string, url: string, fileName: string) => void;
  getDocument: (docType: string) => any;
}

export function ExclusaoDependenteForm({ formData, updateFormData, handleDocumentUpload, getDocument }: FormProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Autoriza cobrança de despesas pendentes. Mesmos prazos de carência em caso de retorno.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Nome do Titular *</Label>
        <Input 
          value={formData.nome_titular || formData.nome} 
          onChange={(e) => updateFormData("nome_titular", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Nome do Dependente a ser Excluído *</Label>
        <Input 
          value={formData.nome_dependente || ""} 
          onChange={(e) => updateFormData("nome_dependente", e.target.value)} 
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

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-semibold">Documentos Obrigatórios</h3>
        <RequestDocumentUpload
          label="Carteira de Beneficiário"
          required
          requestType="exclusao_dependente"
          onUpload={(url, name) => handleDocumentUpload("carteira", url, name)}
          currentFile={getDocument("carteira")}
        />
      </div>
    </div>
  );
}
