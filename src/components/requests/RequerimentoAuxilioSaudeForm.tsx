import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RequestDocumentUpload } from "@/components/RequestDocumentUpload";

interface FormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  handleDocumentUpload: (docType: string, url: string, fileName: string) => void;
  getDocument: (docType: string) => any;
}

export function RequerimentoAuxilioSaudeForm({ formData, updateFormData, handleDocumentUpload, getDocument }: FormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do Beneficiário *</Label>
        <Input 
          value={formData.nome_beneficiario || formData.nome} 
          onChange={(e) => updateFormData("nome_beneficiario", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Matrícula no Funsep *</Label>
        <Input 
          value={formData.matricula} 
          onChange={(e) => updateFormData("matricula", e.target.value)} 
          required 
          disabled={!!formData.matricula}
        />
      </div>

      <div className="space-y-2">
        <Label>Endereço Completo *</Label>
        <Input 
          value={formData.endereco || ""} 
          onChange={(e) => updateFormData("endereco", e.target.value)} 
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
          label="RG e CPF de todos os beneficiários incluídos no Plano"
          required
          requestType="requerimento_auxilio_saude"
          onUpload={(url, name) => handleDocumentUpload("rg_cpf_beneficiarios", url, name)}
          currentFile={getDocument("rg_cpf_beneficiarios")}
        />
      </div>
    </div>
  );
}
