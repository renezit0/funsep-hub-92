import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCog, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalBeneficiarios: number;
  beneficiariosAtivos: number;
  totalDependentes: number;
  totalUsuarios: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBeneficiarios: 0,
    beneficiariosAtivos: 0,
    totalDependentes: 0,
    totalUsuarios: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Contar beneficiários
      const { count: totalBeneficiarios } = await supabase
        .from('cadben')
        .select('*', { count: 'exact', head: true });

      // Contar beneficiários ativos (situacao = 1)
      const { count: beneficiariosAtivos } = await supabase
        .from('cadben')
        .select('*', { count: 'exact', head: true })
        .eq('situacao', 1);

      // Contar dependentes
      const { count: totalDependentes } = await supabase
        .from('caddep')
        .select('*', { count: 'exact', head: true });

      // Contar usuários
      const { count: totalUsuarios } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalBeneficiarios: totalBeneficiarios || 0,
        beneficiariosAtivos: beneficiariosAtivos || 0,
        totalDependentes: totalDependentes || 0,
        totalUsuarios: totalUsuarios || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Associados",
      value: stats.totalBeneficiarios,
      icon: Users,
      description: "Todos os associados cadastrados"
    },
    {
      title: "Asssociados Ativos",
      value: stats.beneficiariosAtivos,
      icon: Activity,
      description: "Associados com situação ativa"
    },
    {
      title: "Total de Dependentes",
      value: stats.totalDependentes,
      icon: UserPlus,
      description: "Dependentes cadastrados"
    },
    {
      title: "Usuários do Sistema",
      value: stats.totalUsuarios,
      icon: UserCog,
      description: "Usuários administrativos"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-6 sm:h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visão geral do sistema FUNSEP
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium leading-tight">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Status dos Asssociados</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• <strong>1:</strong> Ativo</li>
                <li>• <strong>2:</strong> Reativado</li>
                <li>• <strong>3:</strong> Inativo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Sobre o Sistema</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Este painel permite gerenciar associados, dependentes e usuários do sistema FUNSEP.
                Use o menu lateral para navegar entre as diferentes seções.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}