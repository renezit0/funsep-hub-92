import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCog } from "lucide-react";
import { getAdminClient } from "@/integrations/supabase/admin-client";

interface DashboardStats {
  beneficiariosAtivos: number;
  dependentesAtivos: number;
  totalUsuarios: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    beneficiariosAtivos: 0,
    dependentesAtivos: 0,
    totalUsuarios: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const supabase = getAdminClient();
    try {
      // Contar beneficiários ativos (situacao = 1 ou 2)
      const { count: beneficiariosAtivos } = await supabase
        .from("cadben")
        .select("*", { count: "exact", head: true })
        .in("situacao", [1, 2]);

      // Contar dependentes ativos (situacao = 1 ou 2)
      const { count: dependentesAtivos } = await supabase
        .from("caddep")
        .select("*", { count: "exact", head: true })
        .in("situacao", [1, 2]);

      // Contar usuários
      const { count: totalUsuarios } = await supabase.from("usuarios").select("*", { count: "exact", head: true });

      setStats({
        beneficiariosAtivos: beneficiariosAtivos || 0,
        dependentesAtivos: dependentesAtivos || 0,
        totalUsuarios: totalUsuarios || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Associados Ativos",
      value: stats.beneficiariosAtivos,
      icon: Users,
      description: "Associados com situação ativa ou reativada",
    },
    {
      title: "Dependentes Ativos",
      value: stats.dependentesAtivos,
      icon: UserPlus,
      description: "Dependentes com situação ativa ou reativada",
    },
    {
      title: "Usuários do Sistema",
      value: stats.totalUsuarios,
      icon: UserCog,
      description: "Usuários administrativos",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
        <p className="text-sm sm:text-base text-muted-foreground">Visão geral do sistema FUNSEP</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium leading-tight">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
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
              <h3 className="font-semibold">Status dos Associados</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>
                  • <strong>1:</strong> Ativo
                </li>
                <li>
                  • <strong>2:</strong> Reativado
                </li>
                <li>
                  • <strong>3:</strong> Inativo
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Nota:</strong> O dashboard mostra apenas associados e dependentes com situação Ativa (1) ou
                Reativada (2).
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Sobre o Sistema</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Este painel permite gerenciar associados, dependentes e usuários do sistema FUNSEP. Use o menu lateral
                para navegar entre as diferentes seções.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
