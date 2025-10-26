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

  // Render HTML content directly (now it comes from Quill as proper HTML)
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{secao.titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-base lg:prose-lg max-w-none dark:prose-invert
                       prose-headings:font-bold prose-headings:text-foreground 
                       prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                       prose-h1:mb-6 prose-h2:mb-4 prose-h3:mb-3
                       prose-h1:mt-8 prose-h2:mt-6 prose-h3:mt-4
                       prose-p:text-foreground prose-p:mb-4 prose-p:leading-relaxed
                       prose-strong:text-foreground prose-strong:font-bold
                       prose-li:text-foreground prose-li:mb-2 prose-li:leading-relaxed
                       prose-ul:my-4 prose-ul:space-y-2
                       prose-ol:my-4 prose-ol:space-y-2
                       prose-table:my-8 prose-table:mx-auto prose-table:border-collapse
                       prose-th:border prose-th:border-border prose-th:bg-muted 
                       prose-th:p-3 prose-th:text-left prose-th:font-semibold
                       prose-td:border prose-td:border-border prose-td:p-3
                       prose-a:text-primary prose-a:underline
                       [&_table]:mx-auto [&_table]:w-auto [&_table]:max-w-full"
            dangerouslySetInnerHTML={{ 
              __html: secao.conteudo
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
