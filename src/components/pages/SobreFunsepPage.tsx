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

  // Convert simple markdown-like text to HTML
  const formatContent = (content: string) => {
    let html = content;
    
    // Convert **bold** to <strong>
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown tables to HTML tables
    const lines = html.split('\n');
    let inTable = false;
    let processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line is a table row
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          processedLines.push('<div class="my-6 overflow-x-auto flex justify-center"><table class="border-collapse border border-border">');
          inTable = true;
        }
        
        // Skip separator lines
        if (line.match(/^\|[\s\-:]+\|/)) {
          continue;
        }
        
        // Process table row
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
        const isHeader = i === 0 || (lines[i-1] && lines[i-1].match(/^\|[\s\-:]+\|/)) || line.includes('Faixa') || line.includes('Enfermaria');
        
        processedLines.push('<tr>');
        cells.forEach(cell => {
          if (isHeader) {
            processedLines.push(`<th class="border border-border px-4 py-2 bg-muted font-semibold text-left">${cell}</th>`);
          } else {
            processedLines.push(`<td class="border border-border px-4 py-2">${cell}</td>`);
          }
        });
        processedLines.push('</tr>');
      } else {
        if (inTable) {
          processedLines.push('</table></div>');
          inTable = false;
        }
        
        // Convert list items (support both - and ✦)
        if (line.startsWith('- ') || line.startsWith('✦ ')) {
          if (processedLines[processedLines.length - 1] !== '<ul class="my-4 space-y-2 list-disc list-inside">') {
            processedLines.push('<ul class="my-4 space-y-2 list-disc list-inside">');
          }
          const itemText = line.startsWith('- ') ? line.substring(2) : line.substring(2);
          processedLines.push(`<li>${itemText}</li>`);
        } else if (processedLines[processedLines.length - 1]?.startsWith('<ul')) {
          processedLines.push('</ul>');
          if (line) {
            processedLines.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
          }
        } else if (line) {
          processedLines.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
        } else {
          // Empty line - add spacing
          processedLines.push('<div class="h-2"></div>');
        }
      }
    }
    
    if (inTable) {
      processedLines.push('</table></div>');
    }
    
    if (processedLines[processedLines.length - 1]?.startsWith('<ul')) {
      processedLines.push('</ul>');
    }
    
    return processedLines.join('');
  };

  // Render content
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{secao.titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-base lg:prose-lg max-w-none dark:prose-invert text-foreground"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(secao.conteudo)
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
