import React, { useState, useEffect } from "react";
import { getAdminClient } from "@/integrations/supabase/admin-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SobreFunsepModal } from "@/components/modals/SobreFunsepModal";

interface SobreFunsepSecao {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  ordem: number;
  publicado: boolean;
  updated_at: string;
  atualizado_por_sigla: string | null;
}

export function SobreFunsepManagementPage() {
  const [secoes, setSecoes] = useState<SobreFunsepSecao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSecao, setEditingSecao] = useState<SobreFunsepSecao | null>(null);

  useEffect(() => {
    loadSecoes();
  }, []);

  const loadSecoes = async () => {
    const supabase = getAdminClient();
    setLoading(true);
    const { data, error } = await supabase
      .from("sobre_funsep")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar seções");
      console.error("Erro:", error);
    } else {
      setSecoes(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (secao: SobreFunsepSecao) => {
    setEditingSecao(secao);
    setIsModalOpen(true);
  };

  const togglePublish = async (secao: SobreFunsepSecao) => {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("sobre_funsep")
      .update({ 
        publicado: !secao.publicado,
        updated_at: new Date().toISOString()
      })
      .eq("id", secao.id);

    if (error) {
      toast.error("Erro ao atualizar status");
      console.error("Erro:", error);
    } else {
      toast.success(`Seção ${!secao.publicado ? "publicada" : "ocultada"} com sucesso`);
      loadSecoes();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSecao(null);
  };

  const handleSuccess = () => {
    loadSecoes();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sobre o FUNSEP</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o conteúdo das seções sobre o FUNSEP
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seções do Sobre o FUNSEP</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última atualização</TableHead>
                <TableHead>Atualizado por</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secoes.map((secao) => (
                <TableRow key={secao.id}>
                  <TableCell>{secao.ordem}</TableCell>
                  <TableCell className="font-medium">{secao.titulo}</TableCell>
                  <TableCell>
                    <Badge variant={secao.publicado ? "default" : "secondary"}>
                      {secao.publicado ? "Publicado" : "Oculto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(secao.updated_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{secao.atualizado_por_sigla || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(secao)}
                      title={secao.publicado ? "Ocultar" : "Publicar"}
                    >
                      {secao.publicado ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(secao)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SobreFunsepModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        editingSecao={editingSecao}
      />
    </div>
  );
}
