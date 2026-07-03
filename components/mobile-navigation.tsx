'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  DollarSign,
  LayoutDashboard,
  Menu,
  Package,
  PackageSearch,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { name: 'Estoque', href: '/dashboard/estoque', icon: PackageSearch },
  { name: 'Vendas', href: '/dashboard/vendas', icon: ShoppingCart },
  { name: 'Financeiro', href: '/dashboard/financeiro', icon: DollarSign },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart2 },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir navegação</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[290px] border-slate-800 bg-[#102d27] p-0 text-white">
        <SheetHeader className="border-b border-white/10 px-5 py-6 text-left">
          <SheetTitle><BrandLogo inverted /></SheetTitle>
        </SheetHeader>
        <nav className="grid gap-1 p-4">
          {items.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors',
                  active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'text-[#e8a84c]')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
