import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SobreFunsepSecao {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  ordem: number;
}

interface SobreFunsepPageProps {
  slug?: string;
}

export function SobreFunsepPage({ slug: propSlug }: SobreFunsepPageProps = {}) {
  const [searchParams] = useSearchParams();
  const slug = propSlug || searchParams.get("secao") || "quem-somos";
  const [secao, setSecao] = useState<SobreFunsepSecao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Loading secao with slug:", slug);
    
    const loadSecao = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: err } = await supabase
        .from("sobre_funsep")
        .select("*")
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();

      if (err) {
        setError("Erro ao carregar conteúdo");
        console.error("Erro ao carregar seção:", err, "slug:", slug);
      } else if (!data) {
        setError("Conteúdo não encontrado");
        console.error("Nenhum dado encontrado para o slug:", slug);
      } else {
        console.log("Seção carregada:", data);
        setSecao(data);
      }
      
      setLoading(false);
    };
    
    loadSecao();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
      </div>
    );
  }

  if (error || !secao) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Conteúdo não encontrado"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format content with proper line breaks and styling
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map(paragraph => {
        // Check if it's a list item or heading
        if (paragraph.startsWith('✦') || paragraph.startsWith('-')) {
          return `<li class="ml-4 mb-2">${paragraph.replace(/^[✦-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
        }
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return `<h3 class="text-xl font-bold mt-6 mb-3">${paragraph.replace(/\*\*/g, '')}</h3>`;
        }
        if (paragraph.includes('|')) {
          // Simple table detection
          return `<div class="overflow-x-auto my-4"><pre class="bg-muted p-4 rounded">${paragraph}</pre></div>`;
        }
        // Regular paragraph
        return `<p class="mb-4 leading-relaxed">${paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      })
      .join('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{secao.titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="text-foreground space-y-2"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(secao.conteudo)
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
