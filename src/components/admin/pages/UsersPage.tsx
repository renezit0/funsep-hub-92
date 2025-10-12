import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserCog, Shield, Pencil, UserPlus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { EditUserModal } from "@/components/modals/EditUserModal";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface User {
  sigla: string;
  nome: string;
  cargo: string;
  secao: string;
  senha: string;
  status: string;
}

export function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  
  const canManageUsers = session?.user?.cargo && 
    ['GERENTE', 'DESENVOLVEDOR', 'ANALISTA DE SISTEMAS'].includes(session.user.cargo);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('sigla, nome, cargo, secao, senha, status')
        .order('nome');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    // Filtrar por status (mostrar inativos apenas se o toggle estiver ativo)
    if (!showInactive && user.status !== 'ATIVO') return false;
    
    return searchTerm === "" || 
      user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.secao?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
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
          <UserCog className="h-8 w-8" />
          Usuários do Sistema
        </h1>
        <p className="text-muted-foreground">
          Gerenciamento de usuários administrativos
        </p>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, sigla, cargo ou seção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="cursor-pointer">
            Mostrar inativos
          </Label>
        </div>
        
        {canManageUsers && (
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filteredUsers.length} usuários encontrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.sigla}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{user.nome || 'Nome não informado'}</h3>
                      <Badge variant={user.status === 'ATIVO' ? 'default' : 'secondary'}>
                        {user.status || 'ATIVO'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <strong>Sigla:</strong> {user.sigla}
                      </div>
                      <div>
                        <strong>Cargo:</strong> {user.cargo || '-'}
                      </div>
                      <div>
                        <strong>Seção:</strong> {user.secao || '-'}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <strong>Senha:</strong> {user.senha ? '••••••••' : 'Não definida'}
                    </div>
                  </div>
                  
                  {canManageUsers && (
                    <div className="ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado com os filtros aplicados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditUserModal
        user={editingUser}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUserUpdated={loadUsers}
      />

      <AddUserModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onUserAdded={loadUsers}
      />
    </div>
  );
}