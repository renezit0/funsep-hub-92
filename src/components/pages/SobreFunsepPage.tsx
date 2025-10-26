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
            className="prose prose-sm md:prose-base max-w-none dark:prose-invert
                       prose-headings:text-foreground prose-p:text-foreground 
                       prose-strong:text-foreground prose-li:text-foreground
                       prose-table:border prose-th:border prose-th:border-border 
                       prose-td:border prose-td:border-border prose-th:bg-muted
                       prose-th:p-2 prose-td:p-2"
            dangerouslySetInnerHTML={{ 
              __html: secao.conteudo
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
