import { useState, useEffect } from "react";
import { Users, Hospital, Heart, ArrowRight, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import 'react-quill/dist/quill.snow.css';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  imagem_url: string | null;
  data_publicacao: string;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);

  useEffect(() => {
    loadNoticias();
  }, []);

  const loadNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('publicado', true)
        .order('data_publicacao', { ascending: false })
        .limit(3);

      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
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

  // Visualização de notícia individual
  if (selectedNoticia) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedNoticia(null)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para início
        </Button>

        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className={`${getCategoryColor(selectedNoticia.categoria)} text-white`}>
                {selectedNoticia.categoria}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedNoticia.data_publicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              {selectedNoticia.titulo}
            </h1>
            
            <div 
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:text-foreground 
                prose-p:text-foreground/90 
                prose-a:text-primary 
                prose-strong:text-foreground
                prose-ul:text-foreground/90
                prose-ol:text-foreground/90 mb-6"
              dangerouslySetInnerHTML={{ __html: selectedNoticia.conteudo }}
            />
            
            {selectedNoticia.imagem_url && (
              <img
                src={selectedNoticia.imagem_url}
                alt={selectedNoticia.titulo}
                className="w-full h-64 md:h-96 object-cover rounded-lg mt-6"
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Página inicial normal
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            Bem-vindo ao FUNSEP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            O FUNSEP é uma instituição que existe para dar assistência à saúde dos servidores 
            do Poder Judiciário e seus dependentes. O Fundo foi criado em 1983, por um decreto 
            da Presidência do Tribunal de Justiça.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A sua administração é feita por um Conselho Diretor do qual fazem parte quatro 
            servidores. Com um quadro próprio de funcionários, o FUNSEP está instalado no 
            Centro Cívico, na rua Papa João XXIII, 244.
          </p>
        </CardContent>
      </Card>


      {/* Latest News Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Hospital className="h-6 w-6 text-primary" />
              </div>
              Últimas Notícias
            </CardTitle>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => onNavigate("news")}
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {noticias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma notícia disponível no momento.
            </div>
          ) : (
            <div className="space-y-4">
              {noticias.map((noticia) => (
                <div key={noticia.id} className="p-4 border rounded-lg border-border hover:bg-accent/50 transition-colors">
                  <div className="flex gap-3 mb-3 text-xs">
                    <Badge className={`${getCategoryColor(noticia.categoria)} text-white`}>
                      {noticia.categoria}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(new Date(noticia.data_publicacao), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    {noticia.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {noticia.resumo.length > 120 ? `${noticia.resumo.substring(0, 120)}...` : noticia.resumo}
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => setSelectedNoticia(noticia)}
                  >
                    Leia mais
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}