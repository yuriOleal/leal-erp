'use client';

import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Search, Bell, Moon, Sun, User, LogOut } from 'lucide-react';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { user, signOut } = useApp();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const userEmail = user?.email ?? '';
  const userInitials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'US';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Busca global..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-border rounded-lg text-sm w-80 focus-visible:ring-primary/20 h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <div className="h-8 w-px bg-border mx-2" />
        <Button onClick={() => router.push('/dashboard/vendas')} className="rounded-lg text-sm font-semibold">
          Nova Venda
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Minha Conta</p>
                  <p className="text-xs leading-none text-muted-foreground truncate" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/configuracoes')}>
              <User className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair da conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
