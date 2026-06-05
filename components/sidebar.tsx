// ================================================================
// SIDEBAR — Menu de navegação lateral do dashboard
//
// Renderiza a barra lateral esquerda com:
// - Logo "Leal ERP" (clicável, volta ao dashboard)
// - Links de navegação para cada módulo do ERP
// - Destaque visual no link da página atual (rota ativa)
// - Card do usuário logado no rodapé (com iniciais e email reais)
//
// Dados dinâmicos: puxa o email e nome do usuário autenticado via AppContext.
// ================================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, ShoppingCart, DollarSign, Settings, BarChart2, PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/AppContext';

// ── Definição das rotas de navegação ──
// Cada item tem: nome (exibido), href (URL), icon (ícone Lucide)
const navigation = [
  { name: 'Dashboard',   href: '/dashboard',               icon: LayoutDashboard },
  { name: 'Clientes',    href: '/dashboard/clientes',      icon: Users },
  { name: 'Produtos',    href: '/dashboard/produtos',      icon: Package },
  { name: 'Estoque',     href: '/dashboard/estoque',       icon: PackageSearch },
  { name: 'Vendas',      href: '/dashboard/vendas',        icon: ShoppingCart },
  { name: 'Financeiro',  href: '/dashboard/financeiro',    icon: DollarSign },
  { name: 'Relatórios',  href: '/dashboard/relatorios',    icon: BarChart2 },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname(); // Rota atual (para destacar o link ativo)
  const { user } = useApp();     // Dados do usuário autenticado

  // Extrai iniciais e nome a partir do email ou metadata do Supabase
  const userEmail = user?.email ?? '';
  const userInitials = userEmail
    ? userEmail.substring(0, 2).toUpperCase() // Pega as 2 primeiras letras do email
    : '??';
  const userName = user?.user_metadata?.full_name ?? userEmail?.split('@')[0] ?? 'Usuário';

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900">
      {/* ── Logo ── */}
      <div className="p-6 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          Leal ERP
        </Link>
      </div>

      {/* ── Links de Navegação ── */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            // Compara a rota atual com a href do item para destacar o ativo
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400'        // Estilo do item ativo
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50' // Estilo normal
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                  <span className={isActive ? 'font-medium' : 'font-normal'}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Card do Usuário Logado (rodapé da sidebar) ── */}
      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl">
          {/* Avatar com iniciais do usuário */}
          <div className="w-10 h-10 bg-indigo-600 rounded-full border-2 border-slate-700 flex items-center justify-center text-white font-bold text-sm">
            {userInitials}
          </div>
          {/* Nome e email do usuário logado */}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail || 'carregando...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
