'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  BarChart2,
  PackageSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/AppContext';
import { BrandLogo } from '@/components/brand-logo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { name: 'Estoque', href: '/dashboard/estoque', icon: PackageSearch },
  { name: 'Vendas', href: '/dashboard/vendas', icon: ShoppingCart },
  { name: 'Financeiro', href: '/dashboard/financeiro', icon: DollarSign },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart2 },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useApp();

  const userEmail = user?.email ?? '';
  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : '??';
  const userName = user?.user_metadata?.full_name ?? userEmail?.split('@')[0] ?? 'Usuário';

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-slate-800 bg-[#102d27] lg:flex">
      <div className="px-5 py-6">
        <Link href="/dashboard" aria-label="Leal ERP — dashboard">
          <BrandLogo inverted />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/55 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-[#e8a84c]' : 'text-white/45 group-hover:text-white/80')} />
              <span className={cn(isActive ? 'font-semibold' : 'font-medium')}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Ambiente</p>
          <p className="mt-1 text-sm font-semibold text-white">Operação conectada</p>
          <p className="text-xs text-white/45">Supabase + dados reais</p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-950/25 p-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#e8a84c] text-sm font-bold text-[#17352d]">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-xs text-white/45">{userEmail || 'carregando...'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
