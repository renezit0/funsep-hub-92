import { useState, useEffect } from "react";
import { Users, Hospital, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  data_publicacao: string;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    loadNoticias();
  }, []);

  const loadNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('id, titulo, resumo, categoria, data_publicacao')
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
      'Saúde': 'bg-primary text-primary-foreground',
      'Informativo': 'bg-blue-500 text-white',
      'Benefícios': 'bg-green-500 text-white',
      'Tecnologia': 'bg-purple-500 text-white',
      'Geral': 'bg-gray-500 text-white'
    };
    return colors[categoria] || 'bg-gray-500 text-white';
  };

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
                    <span className={`px-2 py-1 rounded font-medium ${getCategoryColor(noticia.categoria)}`}>
                      {noticia.categoria}
                    </span>
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
                  <Button variant="link" className="p-0 h-auto text-primary">
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