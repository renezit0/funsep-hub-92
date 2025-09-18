import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Key, Plus, Edit2, Trash2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface Senha {
  id: string;
  cpf: string;
  senha: string;
  matricula: number;
  nome: string;
  created_at: string;
  created_by_sigla: string;
}

interface Beneficiario {
  matricula: number;
  nome: string;
  cpf: number;
  situacao: number;
}

export function PasswordsPage() {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSenha, setEditingSenha] = useState<Senha | null>(null);
  
  // Separar o campo de busca do formulário
  const [beneficiarioSearch, setBeneficiarioSearch] = useState("");
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
    matricula: "",
    nome: ""
  });
  const { session } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar senhas existentes
      const { data: senhasData, error: senhasError } = await supabase
        .from('senhas')
        .select('*')
        .order('created_at', { ascending: false });

      if (senhasError) throw senhasError;
      setSenhas(senhasData || []);

      // Carregar TODOS os beneficiários - com debug
      console.log('Iniciando busca de beneficiários...');
      const { data: beneficiariosData, error: benError } = await supabase
        .from("cadben")
        .select("matricula, nome, cpf, situacao")
        .in("situacao", [1, 2])
        .order("nome");

      console.log('Resultado da busca:', { beneficiariosData, benError });
      console.log('Total de beneficiários encontrados:', beneficiariosData?.length || 0);
      
      if (benError) {
        console.error('Erro na consulta de beneficiários:', benError);
        throw benError;
      }
      
      setBeneficiarios(beneficiariosData || []);
      
      // Debug dos primeiros registros
      if (beneficiariosData && beneficiariosData.length > 0) {
        console.log('Primeiros 3 beneficiários:', beneficiariosData.slice(0, 3));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cleanCpf = formData.cpf.replace(/\D/g, "");
      
      if (editingSenha) {
        // Atualizar senha existente
        const { error } = await supabase
          .from('senhas')
          .update({
            cpf: cleanCpf,
            senha: formData.senha,
            matricula: parseInt(formData.matricula),
            nome: formData.nome
          })
          .eq('id', editingSenha.id);

        if (error) throw error;
        toast.success('Senha atualizada com sucesso!');
      } else {
        // Criar nova senha
        const { error } = await supabase
          .from('senhas')
          .insert({
            cpf: cleanCpf,
            senha: formData.senha,
            matricula: parseInt(formData.matricula),
            nome: formData.nome,
            created_by_sigla: session?.sigla
          });

        if (error) throw error;
        toast.success('Senha criada com sucesso!');
      }

      setFormData({ cpf: "", senha: "", matricula: "", nome: "" });
      setBeneficiarioSearch("");
      setShowCreateModal(false);
      setEditingSenha(null);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar senha:', error);
      if (error.code === '23505') {
        toast.error('Já existe uma senha cadastrada para este CPF');
      } else {
        toast.error('Erro ao salvar senha');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta senha?')) return;

    try {
      const { error } = await supabase
        .from('senhas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Senha excluída com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir senha:', error);
      toast.error('Erro ao excluir senha');
    }
  };

  const handleEdit = (senha: Senha) => {
    setEditingSenha(senha);
    setFormData({
      cpf: senha.cpf,
      senha: senha.senha,
      matricula: senha.matricula.toString(),
      nome: senha.nome
    });
    setBeneficiarioSearch("");
    setShowCreateModal(true);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const handleBeneficiarioSelect = (beneficiario: Beneficiario) => {
    setFormData({
      ...formData,
      matricula: beneficiario.matricula.toString(),
      nome: beneficiario.nome,
      cpf: beneficiario.cpf.toString()
    });
    setBeneficiarioSearch(beneficiario.nome);
  };

  const filteredSenhas = senhas.filter(senha => {
    return searchTerm === "" || 
      senha.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senha.cpf?.includes(searchTerm) ||
      senha.matricula?.toString().includes(searchTerm);
  });

  // Filtro corrigido para beneficiários com debug
  const filteredBeneficiarios = useMemo(() => {
    console.log('=== DEBUG FILTRO ===');
    console.log('Termo de busca:', beneficiarioSearch);
    console.log('Total beneficiários:', beneficiarios.length);
    
    if (!beneficiarioSearch || beneficiarioSearch.trim().length < 2) {
      return [];
    }
    
    // Debug: Verificar estrutura dos primeiros dados
    if (beneficiarios.length > 0) {
      console.log('Estrutura do primeiro beneficiário:', beneficiarios[0]);
      console.log('Primeiros 5 nomes:', beneficiarios.slice(0, 5).map(b => ({
        nome: b.nome,
        tipo: typeof b.nome,
        length: b.nome?.length
      })));
    }
    
    const searchTerm = beneficiarioSearch.toLowerCase().trim();
    console.log('Termo normalizado:', searchTerm);
    
    const filtered = beneficiarios.filter((ben, index) => {
      if (!ben) {
        console.log(`Beneficiário ${index} é nulo`);
        return false;
      }
      
      const nome = ben.nome ? ben.nome.toString().toLowerCase().trim() : '';
      const matricula = ben.matricula ? ben.matricula.toString() : '';
      const cpf = ben.cpf ? ben.cpf.toString() : '';
      
      // Debug detalhado para os primeiros registros
      if (index < 5) {
        console.log(`Beneficiário ${index}:`, {
          nome: nome,
          matricula: matricula,
          nomeIncludes: nome.includes(searchTerm),
          searchTerm: searchTerm
        });
      }
      
      const matchNome = nome.includes(searchTerm);
      const matchMatricula = matricula.includes(beneficiarioSearch);
      const matchCpf = cpf.includes(beneficiarioSearch);
      
      return matchNome || matchMatricula || matchCpf;
    });
    
    console.log('Resultados encontrados:', filtered.length);
    if (filtered.length > 0) {
      console.log('Primeiros resultados:', filtered.slice(0, 3));
    }
    
    return filtered.slice(0, 50);
  }, [beneficiarios, beneficiarioSearch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gerenciar Senhas</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          Gerenciar Senhas de Acesso
        </h1>
        <p className="text-muted-foreground">
          Cadastre e gerencie senhas de acesso para beneficiários
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            setEditingSenha(null);
            setFormData({ cpf: "", senha: "", matricula: "", nome: "" });
            setBeneficiarioSearch("");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Senha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSenha ? "Editar Senha" : "Cadastrar Nova Senha"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiarioSearch">Buscar Beneficiário</Label>
                  <Input
                    id="beneficiarioSearch"
                    placeholder="Digite nome, matrícula ou CPF..."
                    value={beneficiarioSearch}
                    onChange={(e) => setBeneficiarioSearch(e.target.value)}
                  />
                  
                  {/* Debug info - remover depois */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      Debug: Total beneficiários: {beneficiarios.length} | 
                      Busca: "{beneficiarioSearch}" | 
                      Filtrados: {filteredBeneficiarios.length}
                    </div>
                  )}
                  
                  {beneficiarioSearch && beneficiarioSearch.length >= 2 && (
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      {filteredBeneficiarios.length > 0 ? (
                        filteredBeneficiarios.map((ben) => (
                          <button
                            key={ben.matricula}
                            type="button"
                            className="w-full text-left p-2 hover:bg-accent flex items-center justify-between"
                            onClick={() => handleBeneficiarioSelect(ben)}
                          >
                            <div>
                              <div className="font-medium">{ben.nome}</div>
                              <div className="text-sm text-muted-foreground">
                                CPF: {formatCPF(ben.cpf.toString())}
                              </div>
                            </div>
                            <Badge variant={ben.situacao === 1 ? "outline" : "destructive"}>
                              Mat: {ben.matricula}
                            </Badge>
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-2">
                          Nenhum beneficiário encontrado para "{beneficiarioSearch}"
                          {beneficiarios.length === 0 && " (Nenhum beneficiário carregado)"}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {beneficiarioSearch && beneficiarioSearch.length < 2 && (
                    <div className="text-xs text-muted-foreground p-2 border rounded-md">
                      Digite pelo menos 2 caracteres para buscar
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    maxLength={14}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  required
                  readOnly={!editingSenha} // Só permite edição manual quando editando
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSenha ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filteredSenhas.length} senhas cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSenhas.map((senha) => (
              <div
                key={senha.id}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{senha.nome}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>CPF:</strong> {formatCPF(senha.cpf)}
                      </div>
                      <div>
                        <strong>Matrícula:</strong> {senha.matricula}
                      </div>
                      <div>
                        <strong>Criado por:</strong> {senha.created_by_sigla}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <strong>Criado em:</strong> {new Date(senha.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(senha)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(senha.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSenhas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma senha encontrada com os filtros aplicados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}