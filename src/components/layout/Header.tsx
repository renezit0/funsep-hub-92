import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
  onLoginClick: () => void;
}

export function Header({ title, onMenuToggle, onLoginClick }: HeaderProps) {
  return (
    <header className="h-header bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-10 w-10 p-0 text-foreground hover:bg-accent"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 relative text-foreground hover:bg-accent"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                0
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notificações</h3>
            </div>
            <div className="p-4 text-sm text-muted-foreground text-center">
              Nenhuma notificação no momento
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={onLoginClick}
        >
          <Avatar className="h-8 w-8 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}