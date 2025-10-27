import React, { useState, useEffect } from "react";
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { NewsModal } from "@/components/modals/NewsModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  publicado: boolean;
  data_publicacao: string | null;
  created_at: string;
  autor_sigla: string;
  imagem_url: string | null;
}

export function NewsPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Noticia | null>(null);
  const { toast } = useToast();

  const loadNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar notícias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNoticias();
  }, []);

  const handleEdit = (noticia: Noticia) => {
    setEditingNews(noticia);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('noticias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notícia excluída com sucesso!",
      });

      loadNoticias();
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir notícia",
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (noticia: Noticia) => {
    try {
      const newPublishedState = !noticia.publicado;
      const { error } = await supabase
        .from('noticias')
        .update({ 
          publicado: newPublishedState,
          data_publicacao: newPublishedState ? new Date().toISOString() : null
        })
        .eq('id', noticia.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Notícia ${newPublishedState ? 'publicada' : 'despublicada'} com sucesso!`,
      });

      loadNoticias();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status da notícia",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Saúde': 'bg-primary',
      'Informativo': 'bg-blue-500',
      'Benefícios': 'bg-green-500',
      'Tecnologia': 'bg-purple-500',
      'Geral': 'bg-gray-500'
    };
    return colors[categoria] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Notícias
          </h1>
          <p className="text-muted-foreground">
            Gerenciamento de notícias e comunicados
          </p>
        </div>
        <Button onClick={() => {
          setEditingNews(null);
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Notícia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Notícias</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : noticias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma notícia encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noticias.map((noticia) => (
                  <TableRow key={noticia.id}>
                    <TableCell className="font-medium">
                      {noticia.titulo}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(noticia.categoria)} text-white`}>
                        {noticia.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={noticia.publicado ? "default" : "secondary"}>
                        {noticia.publicado ? "Publicado" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(noticia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{noticia.autor_sigla}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublish(noticia)}
                        >
                          {noticia.publicado ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(noticia)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(noticia.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNews(null);
        }}
        onSuccess={loadNoticias}
        editingNews={editingNews}
      />
    </div>
  );
}