import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const requestTypes = [
  { value: "exclusao_associado", label: "Exclusão de Associado", requiresLogin: true },
  { value: "exclusao_dependente", label: "Exclusão de Dependente", requiresLogin: true },
  { value: "inclusao_associado", label: "Inclusão de Associado", requiresLogin: false },
  { value: "inclusao_dependente", label: "Inclusão de Dependente", requiresLogin: true },
  { value: "inclusao_recem_nascido", label: "Inclusão de Recém-Nascido", requiresLogin: true },
  { value: "inscricao_pensionista", label: "Inscrição como Pensionista", requiresLogin: false },
  { value: "requerimento_21_anos", label: "Requerimento - 21 Anos", requiresLogin: true },
  { value: "requerimento_auxilio_saude", label: "Requerimento para Auxílio Saúde", requiresLogin: true },
  { value: "requerimento_diversos", label: "Requerimento - Diversos", requiresLogin: true },
  { value: "requerimento_reembolso", label: "Requerimento para Reembolso", requiresLogin: true },
  { value: "termo_ciencia", label: "Termo de Ciência", requiresLogin: true },
  { value: "termo_compromisso", label: "Termo de Compromisso", requiresLogin: true },
  { value: "termo_opcao", label: "Termo de Opção", requiresLogin: true },
];

export function RequestsPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState<any>({
    nome: session?.user?.nome || "",
    matricula: session?.user?.matricula || "",
    email: "",
    telefone: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedReqType = requestTypes.find(t => t.value === selectedType);
    
    if (!session && selectedReqType?.requiresLogin) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para enviar este tipo de requerimento.",
      });
      return;
    }

    if (!selectedType) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione o tipo de requerimento.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("requerimentos").insert({
        tipo: selectedType,
        matricula: session?.user?.matricula || 0,
        nome_solicitante: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        dados: formData,
        status: "PENDENTE",
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu requerimento foi enviado com sucesso.",
      });

      // Reset form
      setSelectedType("");
      setFormData({
        nome: session?.user?.nome || "",
        matricula: session?.user?.matricula || "",
        email: "",
        telefone: "",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar seu requerimento. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case "inclusao_associado":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Taxa de inscrição: R$ 30,00 por pessoa. Prazos de carência: Consultas (30 dias), Exames diagnósticos (3 meses), Internamentos/cirurgias (6 meses), Parto (10 meses).
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={formData.nome} onChange={(e) => updateFormData("nome", e.target.value)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input value={formData.cpf || ""} onChange={(e) => updateFormData("cpf", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Input type="date" value={formData.dtnasc || ""} onChange={(e) => updateFormData("dtnasc", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sexo *</Label>
                <Select value={formData.sexo || ""} onValueChange={(v) => updateFormData("sexo", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado Civil *</Label>
                <Select value={formData.estcivil || ""} onValueChange={(v) => updateFormData("estcivil", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Solteiro(a)</SelectItem>
                    <SelectItem value="2">Casado(a)</SelectItem>
                    <SelectItem value="3">Divorciado(a)</SelectItem>
                    <SelectItem value="4">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome da Mãe *</Label>
              <Input value={formData.nomemae || ""} onChange={(e) => updateFormData("nomemae", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>RG (Número) *</Label>
              <Input value={formData.identidade || ""} onChange={(e) => updateFormData("identidade", e.target.value)} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>UF RG *</Label>
                <Input value={formData.orgemi || ""} onChange={(e) => updateFormData("orgemi", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Data Expedição *</Label>
                <Input type="date" value={formData.dtemirg || ""} onChange={(e) => updateFormData("dtemirg", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Órgão Expedidor *</Label>
                <Input value={formData.orgemi_nome || ""} onChange={(e) => updateFormData("orgemi_nome", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Endereço *</Label>
              <Input value={formData.endereco || ""} onChange={(e) => updateFormData("endereco", e.target.value)} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Número *</Label>
                <Input value={formData.numero || ""} onChange={(e) => updateFormData("numero", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={formData.complemento || ""} onChange={(e) => updateFormData("complemento", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bairro *</Label>
                <Input value={formData.bairro || ""} onChange={(e) => updateFormData("bairro", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input value={formData.cidade || ""} onChange={(e) => updateFormData("cidade", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Input value={formData.uf || ""} onChange={(e) => updateFormData("uf", e.target.value)} maxLength={2} required />
              </div>
              <div className="space-y-2">
                <Label>CEP *</Label>
                <Input value={formData.cep || ""} onChange={(e) => updateFormData("cep", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Servidor *</Label>
              <Select value={formData.tipofunc || ""} onValueChange={(v) => updateFormData("tipofunc", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTATUTARIO">Estatutário</SelectItem>
                  <SelectItem value="SERVENTUARIO">Serventuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lotação *</Label>
                <Input value={formData.localtrab || ""} onChange={(e) => updateFormData("localtrab", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Input value={formData.cargo || ""} onChange={(e) => updateFormData("cargo", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Matrícula TJ *</Label>
                <Input value={formData.matrfunc || ""} onChange={(e) => updateFormData("matrfunc", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>PIS/PASEP *</Label>
                <Input value={formData.pispasep || ""} onChange={(e) => updateFormData("pispasep", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Banco *</Label>
                <Input value={formData.banco || ""} onChange={(e) => updateFormData("banco", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Agência *</Label>
                <Input value={formData.agencia || ""} onChange={(e) => updateFormData("agencia", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Conta Corrente *</Label>
                <Input value={formData.contacorr || ""} onChange={(e) => updateFormData("contacorr", e.target.value)} required />
              </div>
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
              <Label>Observações</Label>
              <Textarea 
                value={formData.observacoes || ""} 
                onChange={(e) => updateFormData("observacoes", e.target.value)}
                placeholder="Documentos necessários: RG e CPF autenticados, Certidão de Casamento/União Estável (se aplicável), comprovante de endereço, contracheque"
                rows={3}
              />
            </div>
          </div>
        );

      case "requerimento_reembolso":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Titular *</Label>
              <Input value={formData.nome_titular || formData.nome} onChange={(e) => updateFormData("nome_titular", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Nº Cartão Unimed *</Label>
              <Input value={formData.cartao_unimed || ""} onChange={(e) => updateFormData("cartao_unimed", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Nome do Beneficiário que realizou o evento *</Label>
              <Input value={formData.nome_beneficiario || ""} onChange={(e) => updateFormData("nome_beneficiario", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Nº Cartão Unimed do Beneficiário *</Label>
              <Input value={formData.cartao_beneficiario || ""} onChange={(e) => updateFormData("cartao_beneficiario", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Motivo da Solicitação *</Label>
              <Select value={formData.motivo || ""} onValueChange={(v) => updateFormData("motivo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="falta_rede">Falta de rede credenciada</SelectItem>
                  <SelectItem value="nao_credenciado">Médico/Prestador não credenciado</SelectItem>
                  <SelectItem value="urgencia">Urgência/Emergência</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.motivo === "outros" && (
              <div className="space-y-2">
                <Label>Especifique o motivo *</Label>
                <Input value={formData.motivo_outros || ""} onChange={(e) => updateFormData("motivo_outros", e.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label>Registrou protocolo na Unimed?</Label>
              <Select value={formData.tem_protocolo || ""} onValueChange={(v) => updateFormData("tem_protocolo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tem_protocolo === "sim" && (
              <div className="space-y-2">
                <Label>Número do Protocolo *</Label>
                <Input value={formData.num_protocolo || ""} onChange={(e) => updateFormData("num_protocolo", e.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label>Valor Solicitado (R$) *</Label>
              <Input type="number" step="0.01" value={formData.valor || ""} onChange={(e) => updateFormData("valor", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Descrição do Motivo *</Label>
              <Textarea value={formData.descricao || ""} onChange={(e) => updateFormData("descricao", e.target.value)} rows={3} required />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Dados bancários necessários: Nome do titular da conta, CPF/CNPJ, Banco, Agência (sem dígito), Conta (com dígito), Tipo (CC/Poupança)
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Nome do Titular da Conta *</Label>
              <Input value={formData.titular_conta || ""} onChange={(e) => updateFormData("titular_conta", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>CPF do Titular da Conta *</Label>
              <Input value={formData.cpf_titular || ""} onChange={(e) => updateFormData("cpf_titular", e.target.value)} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Banco *</Label>
                <Input value={formData.banco_reemb || ""} onChange={(e) => updateFormData("banco_reemb", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Agência (sem dígito) *</Label>
                <Input value={formData.agencia_reemb || ""} onChange={(e) => updateFormData("agencia_reemb", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Conta (com dígito) *</Label>
                <Input value={formData.conta_reemb || ""} onChange={(e) => updateFormData("conta_reemb", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Conta *</Label>
              <Select value={formData.tipo_conta || ""} onValueChange={(v) => updateFormData("tipo_conta", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Conta Corrente</SelectItem>
                  <SelectItem value="POUP">Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição do Requerimento *</Label>
              <Textarea
                value={formData.descricao || ""}
                onChange={(e) => updateFormData("descricao", e.target.value)}
                placeholder="Descreva detalhadamente seu requerimento..."
                rows={6}
                required
              />
            </div>
          </div>
        );
    }
  };

  const availableTypes = session 
    ? requestTypes 
    : requestTypes.filter(t => !t.requiresLogin);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Requerimentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Envie seus requerimentos para a administração do FUNSEP
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Requerimento</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios (*) para enviar seu requerimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {session && (
                <>
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={session.user.nome} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Matrícula</Label>
                    <Input value={session.user.matricula} disabled className="bg-muted" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Requerimento *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de requerimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedType && (
                <>
                  <div className="space-y-2">
                    <Label>E-mail para Contato *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone para Contato *</Label>
                    <Input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => updateFormData("telefone", e.target.value)}
                      placeholder="(41) 99999-9999"
                      required
                    />
                  </div>

                  {renderFormFields()}
                </>
              )}

              <Button type="submit" disabled={isSubmitting || !selectedType} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Requerimento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}