import React from "react";
import { Shield, Home, Users, UserPlus, UserCog, FileText, ChartBar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSession } from "@/services/adminAuth";
import { AdminPageType } from "@/pages/AdminDashboard";
import funsepLogo from "@/assets/funsep-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  currentPage: AdminPageType;
  onPageChange: (page: AdminPageType) => void;
  session: AdminSession;
  onLogout: () => void;
}

const navigationItems = [
  { id: 'dashboard' as AdminPageType, label: 'Dashboard', icon: Home },
  { id: 'beneficiarios' as AdminPageType, label: 'Beneficiários', icon: Users },
  { id: 'dependentes' as AdminPageType, label: 'Dependentes', icon: UserPlus },
  { id: 'usuarios' as AdminPageType, label: 'Usuários', icon: UserCog },
  { id: 'noticias' as AdminPageType, label: 'Notícias', icon: FileText },
  { id: 'relatorios' as AdminPageType, label: 'Relatórios', icon: ChartBar },
];

export function AdminSidebar({ currentPage, onPageChange, session, onLogout }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/e548bfa7-21ab-4b35-866a-211b0aaa1135.png" alt="FUNSEP" className="h-8 w-8 flex-shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">FUNSEP Admin</h1>
              <p className="text-sm text-muted-foreground truncate">Painel Administrativo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      onClick={() => onPageChange(item.id)}
                      className="h-12"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t mt-auto">
        {!collapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="font-medium truncate">{session.user.nome}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="truncate">{session.user.cargo}</p>
              <p className="truncate">{session.user.sigla}</p>
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          className="w-full gap-2 h-12"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}