import React, { useState, useEffect } from "react";
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

    // Carregar beneficiários - usando OR que é mais confiável
    const { data: beneficiariosData, error: benError } = await supabase
      .from('cadben')
      .select('matricula, nome, cpf, situacao')
      .or('situacao.eq.1,situacao.eq.2')
      .order('nome');

    if (benError) throw benError;
    setBeneficiarios(beneficiariosData || []);
    
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
  };

  const filteredSenhas = senhas.filter(senha => {
    return searchTerm === "" || 
      senha.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senha.cpf?.includes(searchTerm) ||
      senha.matricula?.toString().includes(searchTerm);
  });

  const filteredBeneficiarios = beneficiarios.filter(ben => {
    return formData.matricula === "" ||
      ben.nome?.toLowerCase().includes(formData.matricula.toLowerCase()) ||
      ben.matricula?.toString().includes(formData.matricula);
  });

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
                  <Label htmlFor="matricula">Buscar Associado</Label>
                  <Input
                    id="matricula"
                    placeholder="Digite nome ou matrícula..."
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  />
                  {formData.matricula && filteredBeneficiarios.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {filteredBeneficiarios.slice(0, 5).map((ben) => (
                        <button
                          key={ben.matricula}
                          type="button"
                          className="w-full text-left p-2 hover:bg-accent flex items-center justify-between"
                          onClick={() => handleBeneficiarioSelect(ben)}
                        >
                          <span>{ben.nome}</span>
                          <Badge variant="outline">Mat: {ben.matricula}</Badge>
                        </button>
                      ))}
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