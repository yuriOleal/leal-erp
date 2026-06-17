// ================================================================
// NAVBAR — Barra superior do dashboard
//
// Contém:
// - Campo de busca global por módulos do sistema
// - Botão de alternar tema (claro/escuro)
// - Ícone de notificações com indicador
// - Botão rápido "Nova Venda"
// - Dropdown do usuário (avatar → configurações / sair)
// ================================================================

'use client';

import { useMemo, useState } from 'react';
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
  const { setTheme, theme } = useTheme(); // Controle de tema (next-themes)
  const router = useRouter();
  const { user, signOut } = useApp();     // Dados do usuário + função de logout
  const [searchTerm, setSearchTerm] = useState('');

  // Busca local por módulos. É propositalmente simples: evita API extra,
  // funciona offline e resolve o uso principal da navbar neste estágio.
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

  // ── Logout: limpa a sessão e redireciona para o login ──
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Extrai iniciais do email (ex: "admin@empresa.com" → "AD")
  const userEmail = user?.email ?? '';
  const userInitials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'US';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-8">
      {/* ── Lado esquerdo: Campo de busca ── */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Busca global..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-border rounded-lg text-sm w-80 focus-visible:ring-primary/20 h-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') goToFirstResult();
              if (event.key === 'Escape') setSearchTerm('');
            }}
          />
          {searchResults.length > 0 && (
            <div className="absolute left-0 top-11 z-50 w-80 rounded-lg border bg-popover p-1 text-sm shadow-lg">
              {searchResults.map(result => (
                <button
                  key={result.href}
                  type="button"
                  className="flex w-full items-center rounded-md px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
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

      {/* ── Lado direito: Ações do usuário ── */}
      <div className="flex items-center gap-4">
        {/* Botão de alternar tema (sol/lua) */}
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

        {/* Sino de notificações com bolinha vermelha (indicador visual) */}
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Separador visual */}
        <div className="h-8 w-px bg-border mx-2" />

        {/* Botão rápido: Nova Venda (atalho para o PDV) */}
        <Button onClick={() => router.push('/dashboard/vendas')} className="rounded-lg text-sm font-semibold">
          Nova Venda
        </Button>

        {/* ── Dropdown do usuário (avatar + menu) ── */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
            {/* Cabeçalho: nome e email */}
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
            {/* Link para Configurações */}
            <DropdownMenuItem onClick={() => router.push('/dashboard/configuracoes')}>
              <User className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Botão Sair (vermelho) */}
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
