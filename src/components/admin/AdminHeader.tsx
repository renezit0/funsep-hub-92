import React from "react";
import { Bell, RefreshCw, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSession } from "@/services/adminAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminHeaderProps {
  session: AdminSession;
  onLogout: () => void;
}

export function AdminHeader({ session, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <SidebarTrigger className="lg:hidden" />
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Painel Administrativo</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Gestão do sistema FUNSEP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarFallback className="text-xs sm:text-sm">
                    {session.user.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block min-w-0">
                  <p className="text-sm font-medium truncate">{session.user.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.cargo}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user.nome}</p>
                  <p className="text-xs text-muted-foreground">{session.user.sigla} - {session.user.cargo}</p>
                  <p className="text-xs text-muted-foreground">{session.user.secao}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}