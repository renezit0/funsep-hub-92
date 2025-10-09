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
import { FileText, Send } from "lucide-react";

const requestTypes = [
  { value: "exclusao_associado", label: "Exclusão de Associado" },
  { value: "exclusao_dependente", label: "Exclusão de Dependente" },
  { value: "inclusao_associado", label: "Inclusão de Associado" },
  { value: "inclusao_dependente", label: "Inclusão de Dependente" },
  { value: "inclusao_recem_nascido", label: "Inclusão de Recém-Nascido" },
  { value: "inscricao_pensionista", label: "Inscrição como Pensionista" },
  { value: "requerimento_21_anos", label: "Requerimento - 21 Anos" },
  { value: "requerimento_diversos", label: "Requerimento - Diversos" },
  { value: "requerimento_auxilio_saude", label: "Requerimento para Auxílio Saúde" },
  { value: "requerimento_reembolso", label: "Requerimento para Reembolso" },
  { value: "termo_ciencia", label: "Termo de Ciência" },
  { value: "termo_compromisso", label: "Termo de Compromisso" },
  { value: "termo_opcao", label: "Termo de Opção" },
];

export function RequestsPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    telefone: "",
    descricao: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para enviar um requerimento.",
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
        matricula: session.user.matricula,
        nome_solicitante: session.user.nome,
        email: formData.email,
        telefone: formData.telefone,
        dados: {
          descricao: formData.descricao,
          tipo_label: requestTypes.find(t => t.value === selectedType)?.label,
        },
        status: "PENDENTE",
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu requerimento foi enviado com sucesso.",
      });

      // Reset form
      setSelectedType("");
      setFormData({ email: "", telefone: "", descricao: "" });
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

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar os requerimentos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
              Preencha os dados abaixo para enviar um requerimento à administração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={session.user.nome}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  value={session.user.matricula}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Requerimento *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de requerimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail para Contato *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone para Contato</Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(41) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Requerimento *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva detalhadamente seu requerimento..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
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
