import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SobreFunsepSecao {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  ordem: number;
  publicado: boolean;
}

interface SobreFunsepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSecao: SobreFunsepSecao | null;
}

export function SobreFunsepModal({
  isOpen,
  onClose,
  onSuccess,
  editingSecao,
}: SobreFunsepModalProps) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSecao) {
      setTitulo(editingSecao.titulo);
      setConteudo(editingSecao.conteudo);
    } else {
      setTitulo("");
      setConteudo("");
    }
  }, [editingSecao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!editingSecao) {
      toast.error("Erro: seção não encontrada");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("sobre_funsep")
      .update({
        titulo,
        conteudo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingSecao.id);

    if (error) {
      toast.error("Erro ao atualizar seção");
      console.error("Erro:", error);
    } else {
      toast.success("Seção atualizada com sucesso!");
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Seção: {editingSecao?.titulo}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={15}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Dica: Use **texto** para negrito, quebras de linha duplas para parágrafos
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
