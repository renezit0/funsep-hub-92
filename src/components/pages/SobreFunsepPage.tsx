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

export function SobreFunsepPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("secao") || "quem-somos";
  const [secao, setSecao] = useState<SobreFunsepSecao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecao();
  }, [slug]);

  const loadSecao = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await supabase
      .from("sobre_funsep")
      .select("*")
      .eq("slug", slug)
      .eq("publicado", true)
      .single();

    if (err) {
      setError("Erro ao carregar conteúdo");
      console.error("Erro ao carregar seção:", err);
    } else {
      setSecao(data);
    }
    
    setLoading(false);
  };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{secao.titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm md:prose-base max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: secao.conteudo
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br/>')
                .replace(/^(.*)$/, '<p>$1</p>')
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
