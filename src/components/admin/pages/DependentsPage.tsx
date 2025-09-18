import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Dependent {
  matricula: number;
  nrodep: number;
  nome: string;
  parent: number;
  parentesco_nome?: string;
  situacao: number;
  dtnasc: string;
  sexo: string;
  cpf: string;
  nomemae: string;
  email: string;
}

export function DependentsPage() {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchDependents = async () => {
    if (!searchTerm.trim()) {
      setDependents([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('caddep')
        .select(`
          matricula, nrodep, nome, parent, situacao, dtnasc, sexo, cpf, nomemae, email,
          tabgrpar!fk_caddep_parent_tabgrpar(nome)
        `);

      // Aplicar filtros de busca
      if (searchTerm.trim()) {
        const isNumeric = /^\d+$/.test(searchTerm.trim());
        
        if (isNumeric) {
          // Se for numérico, buscar por matrícula
          query = query.eq('matricula', parseInt(searchTerm));
        } else {
          // Se não for numérico, buscar por nome
          query = query.ilike('nome', `%${searchTerm}%`);
        }
      }

      // Aplicar filtro de status se selecionado
      if (statusFilter !== null) {
        query = query.eq('situacao', statusFilter);
      }

      query = query.order('matricula, nrodep').limit(100);
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Processar dados para incluir nome do parentesco
      const processedData = (data || []).map(item => ({
        ...item,
        parentesco_nome: item.tabgrpar?.nome || 'Não informado'
      }));
      
      setDependents(processedData);
    } catch (error) {
      console.error('Erro ao buscar dependentes:', error);
      setDependents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchDependents();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (situacao: number) => {
    switch (situacao) {
      case 1:
        return <Badge variant="default">Ativo</Badge>;
      case 2:
        return <Badge variant="secondary">Reativado</Badge>;
      case 3:
        return <Badge variant="destructive">Inativo</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getParentTypeBadge = (parentesco_nome?: string) => {
    if (!parentesco_nome || parentesco_nome === 'Não informado') {
      return <Badge variant="outline">Não informado</Badge>;
    }
    return <Badge variant="outline">{parentesco_nome}</Badge>;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '-';
    const cpfStr = cpf.toString().padStart(11, '0');
    return cpfStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr || '-';
    }
  };

  // Filtros já aplicados na query, não precisamos filtrar novamente
  const filteredDependents = dependents || [];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserPlus className="h-8 w-8" />
          Dependentes
        </h1>
        <p className="text-muted-foreground">
          Gerenciamento de dependentes dos associados FUNSEP
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite para buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(1)}
          >
            Ativos
          </Button>
          <Button
            variant={statusFilter === 3 ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(3)}
          >
            Inativos
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {hasSearched ? (
              `${filteredDependents.length} dependentes encontrados`
            ) : (
              "Digite no campo de busca para encontrar dependentes"
            )}
            {filteredDependents.length === 100 && (
              <span className="text-sm text-muted-foreground block">
                (máximo 100 resultados exibidos - refine sua busca se necessário)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasSearched ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Use o campo de busca acima para encontrar dependentes</p>
                <p className="text-sm">Digite nome ou matrícula do titular</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Buscando...</p>
              </div>
            ) : Array.isArray(filteredDependents) && filteredDependents.map((dependent) => (
              <div
                key={`${dependent.matricula}-${dependent.nrodep}`}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{dependent.nome || 'Nome não informado'}</h3>
                      {getStatusBadge(dependent.situacao)}
                      {getParentTypeBadge(dependent.parentesco_nome)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Titular:</strong> {dependent.matricula || '-'}
                      </div>
                      <div>
                        <strong>Nº Dependente:</strong> {dependent.nrodep || '-'}
                      </div>
                      <div>
                        <strong>CPF:</strong> {dependent.cpf ? formatCPF(dependent.cpf) : '-'}
                      </div>
                      <div>
                        <strong>Nascimento:</strong> {formatDate(dependent.dtnasc)}
                      </div>
                      <div>
                        <strong>Sexo:</strong> {dependent.sexo || '-'}
                      </div>
                      <div>
                        <strong>Mãe:</strong> {dependent.nomemae || '-'}
                      </div>
                    </div>
                    
                    {dependent.email && (
                      <div className="text-sm">
                        <strong>Email:</strong> {dependent.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hasSearched && (!Array.isArray(filteredDependents) || filteredDependents.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dependente encontrado</p>
                <p className="text-sm">Tente ajustar os termos da busca</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}