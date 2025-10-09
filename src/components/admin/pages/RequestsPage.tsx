import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Requerimento {
  id: string;
  tipo: string;
  matricula: number;
  nome_solicitante: string;
  email: string;
  telefone: string | null;
  dados: any;
  status: string;
  observacoes_admin: string | null;
  created_at: string;
  updated_at: string;
  respondido_por_sigla: string | null;
  respondido_em: string | null;
}

export function RequestsPage() {
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Requerimento | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("requerimentos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequerimentos(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os requerimentos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      const { error } = await supabase
        .from("requerimentos")
        .update({
          status: newStatus,
          observacoes_admin: observacoes,
          respondido_em: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Status do requerimento atualizado.",
      });

      setSelectedRequest(null);
      setNewStatus("");
      setObservacoes("");
      loadRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o requerimento.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      PENDENTE: { variant: "secondary", icon: Clock },
      EM_ANALISE: { variant: "default", icon: Eye },
      APROVADO: { variant: "default", icon: CheckCircle },
      NEGADO: { variant: "destructive", icon: XCircle },
      CANCELADO: { variant: "outline", icon: XCircle },
    };

    const config = variants[status] || variants.PENDENTE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getRequestTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      exclusao_associado: "Exclusão de Associado",
      exclusao_dependente: "Exclusão de Dependente",
      inclusao_associado: "Inclusão de Associado",
      inclusao_dependente: "Inclusão de Dependente",
      inclusao_recem_nascido: "Inclusão de Recém-Nascido",
      inscricao_pensionista: "Inscrição como Pensionista",
      requerimento_21_anos: "Requerimento - 21 Anos",
      requerimento_diversos: "Requerimento - Diversos",
      requerimento_auxilio_saude: "Requerimento para Auxílio Saúde",
      requerimento_reembolso: "Requerimento para Reembolso",
      termo_ciencia: "Termo de Ciência",
      termo_compromisso: "Termo de Compromisso",
      termo_opcao: "Termo de Opção",
    };
    return labels[tipo] || tipo;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Carregando requerimentos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Requerimentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os requerimentos enviados pelos associados
        </p>
      </div>

      <div className="grid gap-4">
        {requerimentos.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Nenhum requerimento encontrado.
              </p>
            </CardContent>
          </Card>
        ) : (
          requerimentos.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {getRequestTypeLabel(req.tipo)}
                    </CardTitle>
                    <CardDescription>
                      {req.nome_solicitante} - Matrícula: {req.matricula}
                    </CardDescription>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {req.email}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span>{" "}
                    {req.telefone || "Não informado"}
                  </div>
                  <div>
                    <span className="font-medium">Enviado em:</span>{" "}
                    {new Date(req.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Descrição:</p>
                  <p className="text-sm text-muted-foreground">
                    {req.dados?.descricao || "Sem descrição"}
                  </p>
                </div>
                {req.observacoes_admin && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Observações da Administração:</p>
                    <p className="text-sm">{req.observacoes_admin}</p>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setSelectedRequest(req);
                    setNewStatus(req.status);
                    setObservacoes(req.observacoes_admin || "");
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Requerimento</DialogTitle>
            <DialogDescription>
              Atualize o status e adicione observações ao requerimento
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                    <SelectItem value="EM_ANALISE">EM ANÁLISE</SelectItem>
                    <SelectItem value="APROVADO">APROVADO</SelectItem>
                    <SelectItem value="NEGADO">NEGADO</SelectItem>
                    <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre este requerimento..."
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateStatus} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
