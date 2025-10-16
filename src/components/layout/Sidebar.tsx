import { useState } from "react";
import { Home, Newspaper, Star, Book, Gavel, FileText, BarChart3, Settings, Mail, MapPin, Heart, ExternalLink, User, LogIn, Shield, LogOut, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import funsepLogo from "@/assets/funsep-logo.png";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLoginClick: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { id: "home", label: "Início", icon: Home },
  { id: "news", label: "Notícias", icon: Newspaper },
  { id: "benefits", label: "Vantagens", icon: Star },
  { id: "instructions", label: "Instruções", icon: Book },
  { id: "statute", label: "Estatuto", icon: Gavel },
  { id: "requests", label: "Requerimentos", icon: FileText },
  { id: "myRequests", label: "Meus Requerimentos", icon: ClipboardList, requiresAuth: true },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "admin", label: "Administração", icon: Settings },
  { id: "contact", label: "Localização e Contato", icon: MapPin },
  { id: "healthtips", label: "Dicas de Saúde", icon: Heart },
  { id: "links", label: "Links", icon: ExternalLink },
];

export function Sidebar({ currentPage, onPageChange, onLoginClick, isOpen, onToggle }: SidebarProps) {
  const { isAuthenticated, session, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = session?.user.cargo && ['GERENTE', 'DESENVOLVEDOR', 'ANALISTA DE SISTEMAS'].includes(session.user.cargo);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-sidebar bg-sidebar border-r border-sidebar-border z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header with Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center">
            <img 
              src="/images/e548bfa7-21ab-4b35-866a-211b0aaa1135.png" 
              alt="FUNSEP" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4">
          <nav className="py-6 space-y-2">
            {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            // Esconder "Meus Requerimentos" se não estiver logado
            if (item.requiresAuth && !isAuthenticated) {
              return null;
            }
            
            // Hide admin link if not admin
            if (item.id === "admin" && !isAdmin) {
              return null;
            }
            
            // Hide other admin-only items if not admin or beneficiary
            const isBeneficiary = session?.user.cargo === 'ASSOCIADO';
            if ((item.id === "reports") && !isAdmin && !isBeneficiary) {
              return null;
            }
            
            // Special handling for admin link - redirect same tab
            if (item.id === "admin") {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => {
                    window.location.href = '/admin';
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            }
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`
                  w-full justify-start gap-3 h-12 font-medium
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border space-y-2 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
            <Avatar className="h-10 w-10 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {isAuthenticated ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {isAuthenticated ? (
                <>
                  <p className="text-sm font-medium text-sidebar-foreground">{session?.user.nome}</p>
                  <p className="text-xs text-muted-foreground">{session?.user.cargo}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-sidebar-foreground">Visitante</p>
                  <p className="text-xs text-muted-foreground">Não logado</p>
                </>
              )}
            </div>
            
            {isAuthenticated ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-border"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-border"
                onClick={onLoginClick}
                title="Fazer Login"
              >
                <LogIn className="h-4 w-4" />
              </Button>
            )}
          </div>
          
        </div>
      </aside>
    </>
  );
}