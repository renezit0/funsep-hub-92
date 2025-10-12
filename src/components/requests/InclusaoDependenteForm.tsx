import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RequestDocumentUpload } from "@/components/RequestDocumentUpload";

interface FormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  handleDocumentUpload: (docType: string, url: string, fileName: string) => void;
  getDocument: (docType: string) => any;
}

export function InclusaoDependenteForm({ formData, updateFormData, handleDocumentUpload, getDocument }: FormProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Taxa de inscrição: R$ 30,00. Mesmos prazos de carência da inclusão de associado.
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
        <Label>Matrícula no Funsep *</Label>
        <Input 
          value={formData.matricula} 
          onChange={(e) => updateFormData("matricula", e.target.value)} 
          required 
          disabled={!!formData.matricula}
        />
      </div>

      <div className="space-y-2">
        <Label>Nome Completo do Dependente *</Label>
        <Input 
          value={formData.nome_dependente || ""} 
          onChange={(e) => updateFormData("nome_dependente", e.target.value)} 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CPF do Dependente *</Label>
          <Input 
            value={formData.cpf_dependente || ""} 
            onChange={(e) => updateFormData("cpf_dependente", e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label>Data de Nascimento *</Label>
          <Input 
            type="date" 
            value={formData.dtnasc_dependente || ""} 
            onChange={(e) => updateFormData("dtnasc_dependente", e.target.value)} 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nome da Mãe do Dependente *</Label>
        <Input 
          value={formData.nomemae_dependente || ""} 
          onChange={(e) => updateFormData("nomemae_dependente", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de Acomodação *</Label>
        <Select value={formData.tipacomoda || ""} onValueChange={(v) => updateFormData("tipacomoda", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
            <SelectItem value="ENFERMARIA">Enfermaria</SelectItem>
          </SelectContent>
        </Select>
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
          label="RG e CPF (cópia autenticada) ou Certidão de Nascimento"
          required
          requestType="inclusao_dependente"
          onUpload={(url, name) => handleDocumentUpload("rg_cpf_certidao", url, name)}
          currentFile={getDocument("rg_cpf_certidao")}
        />
        <RequestDocumentUpload
          label="Certidão de Casamento/União Estável (se companheiro/a)"
          requestType="inclusao_dependente"
          onUpload={(url, name) => handleDocumentUpload("certidao_casamento", url, name)}
          currentFile={getDocument("certidao_casamento")}
        />
        <RequestDocumentUpload
          label="Comprovante de Endereço Atualizado"
          required
          requestType="inclusao_dependente"
          onUpload={(url, name) => handleDocumentUpload("comprovante_endereco", url, name)}
          currentFile={getDocument("comprovante_endereco")}
        />
        <RequestDocumentUpload
          label="Contracheque"
          required
          requestType="inclusao_dependente"
          onUpload={(url, name) => handleDocumentUpload("contracheque", url, name)}
          currentFile={getDocument("contracheque")}
        />
      </div>
    </div>
  );
}
