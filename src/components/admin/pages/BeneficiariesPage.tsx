import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Beneficiary {
  matricula: number;
  nome: string;
  cpf: number;
  situacao: number;
  dtnasc: string;
  sexo: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
}

export function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBeneficiaries = async () => {
    if (!searchTerm.trim()) {
      setBeneficiaries([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('cadben')
        .select('matricula, nome, cpf, situacao, dtnasc, sexo, email, telefone, cidade, uf');

      // Aplicar filtros de busca
      if (searchTerm.trim()) {
        const isNumeric = /^\d+$/.test(searchTerm.trim());
        
        if (isNumeric) {
          // Se for numérico, buscar por matrícula ou CPF
          query = query.or(`matricula.eq.${searchTerm},cpf.eq.${searchTerm}`);
        } else {
          // Se não for numérico, buscar por nome
          query = query.ilike('nome', `%${searchTerm}%`);
        }
      }

      // Aplicar filtro de status se selecionado
      if (statusFilter !== null) {
        query = query.eq('situacao', statusFilter);
      }

      query = query.order('nome').limit(100);
      
      const { data, error } = await query;

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Erro ao buscar beneficiários:', error);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchBeneficiaries();
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

  const formatCPF = (cpf: number) => {
    if (!cpf && cpf !== 0) return '-';
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
  const filteredBeneficiaries = beneficiaries || [];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Associados</h1>
        <div className="flex items-center justify-center h-32 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 sm:h-8 sm:w-8" />
          Associados
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerenciamento de associados FUNSEP
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nome, matrícula ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setStatusFilter(null)}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 1 ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => setStatusFilter(1)}
          >
            Ativos
          </Button>
          <Button
            variant={statusFilter === 3 ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0"
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
              `${filteredBeneficiaries.length} beneficiários encontrados`
            ) : (
              "Digite no campo de busca para encontrar associados"
            )}
            {filteredBeneficiaries.length === 100 && (
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
                <p>Use o campo de busca acima para encontrar associados</p>
                <p className="text-sm">Digite nome, matrícula ou CPF</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Buscando...</p>
              </div>
            ) : Array.isArray(filteredBeneficiaries) && filteredBeneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.matricula}
                className="border border-border rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">
                      {beneficiary.nome || 'Nome não informado'}
                    </h3>
                    {getStatusBadge(beneficiary.situacao)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div>
                      <strong>Matrícula:</strong> {beneficiary.matricula || '-'}
                    </div>
                    <div>
                      <strong>CPF:</strong> {beneficiary.cpf ? formatCPF(beneficiary.cpf) : '-'}
                    </div>
                    <div>
                      <strong>Nascimento:</strong> {formatDate(beneficiary.dtnasc)}
                    </div>
                    <div>
                      <strong>Sexo:</strong> {beneficiary.sexo || '-'}
                    </div>
                    <div>
                      <strong>Cidade:</strong> {beneficiary.cidade || '-'}
                    </div>
                    <div>
                      <strong>UF:</strong> {beneficiary.uf || '-'}
                    </div>
                  </div>
                  
                  {(beneficiary.email || beneficiary.telefone) && (
                    <div className="space-y-1 pt-2 border-t border-border/50">
                      {beneficiary.email && (
                        <div className="text-xs sm:text-sm">
                          <strong>Email:</strong> 
                          <span className="break-all ml-1">{beneficiary.email}</span>
                        </div>
                      )}
                      
                      {beneficiary.telefone && (
                        <div className="text-xs sm:text-sm">
                          <strong>Telefone:</strong> {beneficiary.telefone}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {hasSearched && (!Array.isArray(filteredBeneficiaries) || filteredBeneficiaries.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum associado encontrado</p>
                <p className="text-sm">Tente ajustar os termos da busca</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}