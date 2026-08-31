// ================================================================
// LAYOUT DO DASHBOARD — Envolve todas as páginas da área logada
//
// Este layout é aplicado em /dashboard e todas as suas sub-rotas:
// /dashboard/clientes, /dashboard/produtos, /dashboard/vendas, etc.
//
// Estrutura:
// ┌──────────────┬──────────────────────────────────┐
// │              │  Navbar (topo)                    │
// │  Sidebar     │                                   │
// │  (menu       │  Conteúdo da página               │
// │   lateral)   │  (children)                       │
// │              │                                   │
// └──────────────┴──────────────────────────────────┘
// ================================================================

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Container principal: altura total da tela, sem scroll externo.
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Barra lateral fixa com navegação (Clientes, Produtos, Vendas, etc.) */}
      <Sidebar />

      {/* Área principal à direita da sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barra do topo (busca, notificações, avatar do usuário) */}
        <Navbar />

        {/* Conteúdo da página atual — faz scroll vertical se necessário */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
