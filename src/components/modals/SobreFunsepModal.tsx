import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

    // Validate input
    if (!titulo.trim()) {
      toast.error("O título é obrigatório");
      setLoading(false);
      return;
    }

    if (!conteudo.trim() || conteudo === '<p><br></p>') {
      toast.error("O conteúdo é obrigatório");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("sobre_funsep")
      .update({
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
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

  // Configuração do editor Quill (sem tabelas por enquanto - requer pacote adicional)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "color",
    "background",
  ];

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
            <div className="min-h-[400px]">
              <ReactQuill
                theme="snow"
                value={conteudo}
                onChange={setConteudo}
                modules={modules}
                formats={formats}
                className="bg-background"
                style={{ height: "350px" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-12">
              Use a barra de ferramentas para formatar o texto, adicionar links, etc. Para tabelas, use o formato markdown: | Coluna 1 | Coluna 2 |
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
