'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Search, Moon, Sun, User, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
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
import { useApp } from '@/lib/context/AppContext';
import { MobileNavigation } from '@/components/mobile-navigation';

const searchableRoutes = [
  { label: 'Dashboard', href: '/dashboard', keywords: 'inicio painel métricas indicadores' },
  { label: 'Clientes', href: '/dashboard/clientes', keywords: 'cliente cpf cnpj contato carteira' },
  { label: 'Produtos', href: '/dashboard/produtos', keywords: 'produto sku catalogo preço' },
  { label: 'Estoque', href: '/dashboard/estoque', keywords: 'estoque inventario entrada saída reposição' },
  { label: 'Vendas', href: '/dashboard/vendas', keywords: 'venda pdv pedido orçamento' },
  { label: 'Financeiro', href: '/dashboard/financeiro', keywords: 'financeiro caixa receita despesa lançamento' },
  { label: 'Relatórios', href: '/dashboard/relatorios', keywords: 'relatorio csv pdf exportar imprimir' },
  { label: 'Configurações', href: '/dashboard/configuracoes', keywords: 'configuração perfil senha tema conta' },
];

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { user, signOut } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Busca local por módulos. É rápida, dispensa API extra e funciona mesmo
  // quando o usuário só lembra parte do nome da área que quer abrir.
  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    return searchableRoutes.filter(route =>
      `${route.label} ${route.keywords}`.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const goToFirstResult = () => {
    const [firstResult] = searchResults;
    if (!firstResult) return;

    setSearchTerm('');
    router.push(firstResult.href);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const userEmail = user?.email ?? '';
  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'US';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/70 bg-white/80 px-4 backdrop-blur-xl dark:bg-slate-950/55 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <MobileNavigation />
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar módulo..."
            className="h-9 w-80 rounded-xl border-border/80 bg-background/75 py-2 pl-10 pr-4 text-sm focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') goToFirstResult();
              if (event.key === 'Escape') setSearchTerm('');
            }}
          />
          {searchResults.length > 0 && (
            <div className="absolute left-0 top-11 z-50 w-80 rounded-2xl border bg-popover p-1 text-sm shadow-xl shadow-slate-900/10">
              {searchResults.map(result => (
                <button
                  key={result.href}
                  type="button"
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setSearchTerm('');
                    router.push(result.href);
                  }}
                >
                  {result.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full text-muted-foreground hover:bg-muted"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        <Button onClick={() => router.push('/dashboard/vendas')} className="rounded-xl text-sm font-semibold">
          <span className="hidden sm:inline">Nova venda</span>
          <ShoppingCart className="h-4 w-4 sm:hidden" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#123c32] text-xs font-bold text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 rounded-2xl" align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">Minha conta</p>
                  <p className="truncate text-xs leading-none text-muted-foreground" title={userEmail}>
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
