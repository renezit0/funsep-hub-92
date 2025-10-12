import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  documentos: any;
}

export function MyRequestsPage() {
  const { session } = useAuth();
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Requerimento | null>(null);

  useEffect(() => {
    if (session?.user?.matricula) {
      loadMyRequests();
    }
  }, [session]);

  const loadMyRequests = async () => {
    if (!session?.user?.matricula) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("requerimentos")
        .select("*")
        .eq("matricula", session.user.matricula)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequerimentos(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      PENDENTE: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      EM_ANALISE: { variant: "default", icon: Eye, color: "text-blue-600" },
      APROVADO: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      NEGADO: { variant: "destructive", icon: XCircle, color: "text-red-600" },
      CANCELADO: { variant: "outline", icon: XCircle, color: "text-gray-600" },
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

  const renderDocumentos = (documentos: Array<{ tipo: string; url: string; nome: string }> | null) => {
    if (!documentos || documentos.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhum documento anexado</p>;
    }

    const labelMap: Record<string, string> = {
      rg_cpf: "RG e CPF",
      comprovante_endereco: "Comprovante de Endereço",
      contracheque: "Contracheque",
      certidao_casamento: "Certidão de Casamento/União Estável",
      certidao_nascimento: "Certidão de Nascimento",
      nota_fiscal: "Nota Fiscal/Recibo",
      comprovante_pagamento: "Comprovante de Pagamento",
      documento_geral: "Documento Anexo",
    };

    return (
      <div className="space-y-2">
        {documentos.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{labelMap[doc.tipo] || doc.tipo}</span>
              <span className="text-xs text-muted-foreground">({doc.nome})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(doc.url, '_blank')}
              title="Abrir em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-muted-foreground">Carregando seus requerimentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Meus Requerimentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o status dos seus requerimentos enviados ao FUNSEP
          </p>
        </div>

        {requerimentos.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <Alert>
                <AlertDescription>
                  Você ainda não enviou nenhum requerimento. Acesse a página de Requerimentos para criar um novo.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requerimentos.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {getRequestTypeLabel(req.tipo)}
                      </CardTitle>
                      <CardDescription>
                        Enviado em {new Date(req.created_at).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(req.created_at).toLocaleTimeString("pt-BR")}
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
                    {req.respondido_em && (
                      <div className="col-span-2">
                        <span className="font-medium">Respondido em:</span>{" "}
                        {new Date(req.respondido_em).toLocaleString("pt-BR")}
                      </div>
                    )}
                  </div>

                  {req.observacoes_admin && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Resposta da Administração:</p>
                      <p className="text-sm">{req.observacoes_admin}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedRequest(req)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Requerimento</DialogTitle>
              <DialogDescription>
                {selectedRequest && getRequestTypeLabel(selectedRequest.tipo)}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Status Atual:</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                {selectedRequest.observacoes_admin && (
                  <div>
                    <p className="text-sm font-medium mb-2">Observações da Administração:</p>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{selectedRequest.observacoes_admin}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.documentos && selectedRequest.documentos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Documentos Enviados:</p>
                    {renderDocumentos(selectedRequest.documentos)}
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  <p>Enviado em: {new Date(selectedRequest.created_at).toLocaleString("pt-BR")}</p>
                  {selectedRequest.respondido_em && (
                    <p>Respondido em: {new Date(selectedRequest.respondido_em).toLocaleString("pt-BR")}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
