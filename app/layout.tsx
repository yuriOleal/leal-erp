// ================================================================
// LAYOUT RAIZ — Envolve TODAS as páginas do projeto
//
// Este é o layout mais externo da aplicação Next.js (App Router).
// Tudo que estiver aqui será renderizado em TODAS as páginas.
//
// Responsabilidades:
// - Configurar fonte (Inter)
// - Configurar metadados SEO (título, descrição)
// - Prover Tema (claro/escuro) via ThemeProvider
// - Prover dados globais via AppContext (Supabase + CRUDs)
// - Prover Tooltips (componentes de dica flutuante)
// ================================================================

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/lib/context/AppContext';

// ── Metadados para SEO e compartilhamento ──
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Leal ERP — vendas, estoque e financeiro em ordem',
    template: '%s | Leal ERP',
  },
  description:
    'Gestão empresarial direta para pequenos comércios e distribuidoras. Conecte vendas, estoque, clientes, financeiro e relatórios.',
  keywords: ['ERP', 'gestão empresarial', 'controle de estoque', 'sistema de vendas', 'financeiro'],
  openGraph: {
    title: 'Leal ERP — sua empresa em ordem',
    description: 'Vendas, estoque, clientes e financeiro conectados em um sistema direto ao ponto.',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/images/leal-operations-hero.png', width: 1536, height: 1024 }],
  },
  robots: { index: true, follow: true },
};

// ── Layout Raiz ──
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        {/*
          Ordem dos Providers (importante!):
          1. ThemeProvider — controla tema claro/escuro
          2. AppProvider    — conecta ao Supabase e gerencia estado global (clientes, produtos, etc.)
          3. TooltipProvider— permite usar tooltips em qualquer componente
        */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppProvider>
            <TooltipProvider delay={0}>
              {children}
            </TooltipProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
