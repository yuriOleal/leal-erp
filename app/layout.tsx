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
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/lib/context/AppContext';

// ── Configuração da fonte Inter (Google Fonts) ──
// A fonte Inter é carregada com subset latin e fica disponível como variável CSS
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// ── Metadados para SEO e compartilhamento ──
export const metadata: Metadata = {
  title: 'Leal ERP',
  description: 'Modern SaaS ERP for small and medium businesses',
};

// ── Layout Raiz ──
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
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
