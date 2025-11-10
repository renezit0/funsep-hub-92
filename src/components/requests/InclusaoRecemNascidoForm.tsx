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

export function InclusaoRecemNascidoForm({ formData, updateFormData, handleDocumentUpload, getDocument }: FormProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Prazo para inscrição: 30 dias da data de nascimento. Taxa: R$ 30,00. Após 30 dias, vigoram prazos de carência normais.
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
        <Label>Nome do Recém-Nascido *</Label>
        <Input 
          value={formData.nome_recem_nascido || ""} 
          onChange={(e) => updateFormData("nome_recem_nascido", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Data de Nascimento *</Label>
        <Input 
          type="date" 
          value={formData.data_nascimento || ""} 
          onChange={(e) => updateFormData("data_nascimento", e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label>Telefone para Contato *</Label>
        <Input 
          type="tel"
          value={formData.telefone || ""} 
          onChange={(e) => updateFormData("telefone", e.target.value)} 
          placeholder="(41) 99999-9999"
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
          label="Certidão de Nascimento (2ª via)"
          required
          requestType="inclusao_recem_nascido"
          onUpload={(url, name) => handleDocumentUpload("certidao_nascimento", url, name)}
          currentFile={getDocument("certidao_nascimento")}
        />
      </div>
    </div>
  );
}
