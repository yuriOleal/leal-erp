// ================================================================
// APP CONTEXT — Estado Global da Aplicação (Context API do React)
//
// Este é o CÉREBRO do Leal ERP. Todo o estado da aplicação
// (clientes, produtos, vendas, transações, usuário logado)
// é gerenciado aqui e distribuído para os componentes.
//
// FLUXO DE DADOS:
//   Supabase (PostgreSQL) ←→ AppContext ←→ Componentes React
//
// O AppContext:
// 1. Mantém os arrays de dados em memória (clients, products, etc.)
// 2. Fornece funções CRUD que chamam o Supabase
// 3. Monitora mudanças de autenticação (login/logout)
// 4. Calcula métricas do dashboard (stats) em tempo real
// 5. Mapeia os dados entre snake_case (PostgreSQL) e camelCase (TypeScript)
//
// ARQUITETURA:
//   AppProvider (provedor) → envolve toda a aplicação no layout.tsx
//   useApp() (hook)        → consumido por qualquer componente "use client"
// ================================================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, Product, Sale, Transaction, DashboardStats } from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ─── INTERFACE DO CONTEXTO ───────────────────────────────────────
// Define TUDO que o AppContext expõe para os componentes.
// Aqui listamos os dados e as funções disponíveis.

interface AppContextType {
  // ── Dados do usuário ──
  user: User | null;        // Objeto do usuário autenticado (Supabase Auth), null se não logado
  isLoading: boolean;       // true enquanto os dados estão sendo carregados do banco

  // ── Listas de dados ──
  clients: Client[];        // Todos os clientes do usuário
  products: Product[];      // Todos os produtos do catálogo
  sales: Sale[];            // Histórico de vendas
  transactions: Transaction[]; // Fluxo de caixa (receitas e despesas)
  stats: DashboardStats;    // Métricas calculadas para o dashboard

  // ── CRUD de Clientes ──
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<{ error: string | null }>;
  updateClient: (id: string, client: Partial<Client>) => Promise<{ error: string | null }>;
  deleteClient: (id: string) => Promise<{ error: string | null }>;

  // ── CRUD de Produtos ──
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ error: string | null }>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ error: string | null }>;
  deleteProduct: (id: string) => Promise<{ error: string | null }>;

  // ── Vendas ──
  // addSale chama a RPC create_sale_with_items no PostgreSQL
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<{ error: string | null }>;

  // ── Transações Financeiras ──
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<{ error: string | null }>;
  deleteTransaction: (id: string) => Promise<{ error: string | null }>;

  // ── Autenticação ──
  signOut: () => Promise<void>;    // Logout: limpa sessão e redireciona
  refreshData: () => Promise<void>; // Recarrega todos os dados do banco
}

// ─── CRIAÇÃO DO CONTEXTO ─────────────────────────────────────────
const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── HELPERS DE MAPEAMENTO ───────────────────────────────────────
// O PostgreSQL/Supabase usa snake_case (ex: "created_at", "purchase_price")
// O TypeScript/React usa camelCase (ex: "createdAt", "purchasePrice")
// Estas funções convertem entre os dois formatos.

/** Converte uma linha da tabela clients (snake_case) para o tipo Client (camelCase) */
const mapClient = (row: Record<string, unknown>): Client => ({
  id: row.id as string,
  name: row.name as string,
  document: row.document as string,
  phone: row.phone as string,
  email: row.email as string,
  address: row.address as string,
  createdAt: (row.created_at as string).split('T')[0], // Pega só a data (YYYY-MM-DD)
});

/** Converte uma linha da tabela products para o tipo Product */
const mapProduct = (row: Record<string, unknown>): Product => ({
  id: row.id as string,
  name: row.name as string,
  sku: row.sku as string,
  category: row.category as string,
  purchasePrice: Number(row.purchase_price),
  salePrice: Number(row.sale_price),
  stock: Number(row.stock),
  supplier: row.supplier as string,
});

/** Converte uma linha da tabela sales (com sale_items aninhados) para o tipo Sale */
const mapSale = (row: Record<string, unknown>): Sale => ({
  id: row.id as string,
  clientId: (row.client_id as string) ?? '',
  clientName: row.client_name as string,
  products: ((row.sale_items as Record<string, unknown>[]) ?? []).map((item: Record<string, unknown>) => ({
    productId: (item.product_id as string) ?? '',
    name: item.name as string,
    quantity: Number(item.quantity),
    price: Number(item.price),
  })),
  total: Number(row.total),
  date: (row.created_at as string).split('T')[0],
  status: row.status as 'completed' | 'pending',
});

/** Converte uma linha da tabela transactions para o tipo Transaction */
const mapTransaction = (row: Record<string, unknown>): Transaction => ({
  id: row.id as string,
  type: row.type as 'income' | 'expense',
  amount: Number(row.amount),
  description: row.description as string,
  category: row.category as string,
  date: (row.created_at as string).split('T')[0],
});

// ─── PROVEDOR DO CONTEXTO ────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient(); // Cliente Supabase (browser)

  // ── Estados locais (dados em memória) ──
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // ── Busca todos os dados do banco para o usuário atual ──
  // useCallback: memoriza a função para não recriar a cada render
  const fetchAllData = useCallback(async (userId: string) => {
    // Promise.all: faz as 4 consultas em PARALELO (mais rápido que sequencial)
    const [clientsRes, productsRes, salesRes, transactionsRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)                     // Filtra apenas dados do usuário
        .order('created_at', { ascending: false }), // Mais recentes primeiro
      supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('sales')
        .select('*, sale_items(*)')                // Inclui os itens da venda (JOIN)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    // Atualiza os estados apenas se a consulta retornou dados
    if (clientsRes.data) setClients(clientsRes.data.map(mapClient));
    if (productsRes.data) setProducts(productsRes.data.map(mapProduct));
    if (salesRes.data) setSales(salesRes.data.map(mapSale));
    if (transactionsRes.data) setTransactions(transactionsRes.data.map(mapTransaction));
  }, [supabase]);

  // ── Recarrega dados (exposto para componentes forçarem refresh) ──
  const refreshData = useCallback(async () => {
    if (user) await fetchAllData(user.id);
  }, [user, fetchAllData]);

  // ── Monitora mudanças de autenticação (login/logout) ──
  useEffect(() => {
    // onAuthStateChange: listener do Supabase que dispara quando o usuário
    // faz login, logout ou o token de acesso é renovado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Usuário fez login → carrega dados do banco
          await fetchAllData(currentUser.id);
        } else {
          // Usuário fez logout → limpa todos os dados
          setClients([]);
          setProducts([]);
          setSales([]);
          setTransactions([]);
        }
        setIsLoading(false);
      }
    );

    // Cleanup: remove o listener quando o componente desmonta
    return () => subscription.unsubscribe();
  }, [supabase, fetchAllData]);

  // ═══════════════════════════════════════════════════════════════
  // CRUD DE CLIENTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Adiciona um novo cliente no Supabase e atualiza o estado local.
   * Retorna { error: null } em caso de sucesso, ou { error: "mensagem" } em caso de erro.
   */
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,               // Associa o cliente ao usuário logado
        name: clientData.name,
        document: clientData.document,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
      })
      .select()                         // Retorna a linha inserida
      .single();                        // Como é 1 registro, usa .single()

    if (error) return { error: error.message };

    // Atualiza o estado local otimisticamente (sem recarregar tudo)
    setClients(prev => [mapClient(data), ...prev]);
    return { error: null };
  };

  /** Atualiza um cliente existente (apenas os campos enviados) */
  const updateClient = async (id: string, clientData: Partial<Client>) => {
    // Converte camelCase → snake_case para o banco
    const updatePayload: Record<string, unknown> = {};
    if (clientData.name !== undefined) updatePayload.name = clientData.name;
    if (clientData.document !== undefined) updatePayload.document = clientData.document;
    if (clientData.phone !== undefined) updatePayload.phone = clientData.phone;
    if (clientData.email !== undefined) updatePayload.email = clientData.email;
    if (clientData.address !== undefined) updatePayload.address = clientData.address;

    const { error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', id);                    // Atualiza apenas o registro com este ID

    if (error) return { error: error.message };

    // Atualiza o estado local (merge dos campos novos com os existentes)
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
    return { error: null };
  };

  /** Remove um cliente do banco */
  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) return { error: error.message };

    // Remove do estado local
    setClients(prev => prev.filter(c => c.id !== id));
    return { error: null };
  };

  // ═══════════════════════════════════════════════════════════════
  // CRUD DE PRODUTOS
  // ═══════════════════════════════════════════════════════════════

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        purchase_price: productData.purchasePrice,   // camelCase → snake_case
        sale_price: productData.salePrice,
        stock: productData.stock,
        supplier: productData.supplier,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    setProducts(prev => [mapProduct(data), ...prev]);
    return { error: null };
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updatePayload: Record<string, unknown> = {};
    if (productData.name !== undefined) updatePayload.name = productData.name;
    if (productData.sku !== undefined) updatePayload.sku = productData.sku;
    if (productData.category !== undefined) updatePayload.category = productData.category;
    if (productData.purchasePrice !== undefined) updatePayload.purchase_price = productData.purchasePrice;
    if (productData.salePrice !== undefined) updatePayload.sale_price = productData.salePrice;
    if (productData.stock !== undefined) updatePayload.stock = productData.stock;
    if (productData.supplier !== undefined) updatePayload.supplier = productData.supplier;

    const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
    if (error) return { error: error.message };

    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    return { error: null };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    setProducts(prev => prev.filter(p => p.id !== id));
    return { error: null };
  };

  // ═══════════════════════════════════════════════════════════════
  // VENDAS (PDV)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Registra uma nova venda.
   *
   * NÃO usa insert direto — chama a RPC (Remote Procedure Call)
   * create_sale_with_items no PostgreSQL.
   *
   * Esta função é ATÔMICA: ou tudo acontece (cria venda + deduz estoque
   * + lança receita) ou nada acontece (em caso de erro).
   */
  const addSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };

    // Chama a função PostgreSQL que criamos em supabase/migration.sql
    const { data, error } = await supabase.rpc('create_sale_with_items', {
      p_user_id: user.id,
      p_client_id: saleData.clientId || null,
      p_client_name: saleData.clientName,
      p_total: saleData.total,
      p_status: saleData.status,
      p_items: saleData.products.map(p => ({
        product_id: p.productId,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
      })),
    });

    if (error) return { error: error.message };
    if (data && !data.success) return { error: data.error };

    // Recarrega TODOS os dados, porque a venda afetou:
    // - sales (nova venda)
    // - products (estoque foi deduzido)
    // - transactions (receita foi lançada)
    await fetchAllData(user.id);
    return { error: null };
  };

  // ═══════════════════════════════════════════════════════════════
  // TRANSAÇÕES FINANCEIRAS
  // ═══════════════════════════════════════════════════════════════

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: txData.type,
        amount: txData.amount,
        description: txData.description,
        category: txData.category,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    setTransactions(prev => [mapTransaction(data), ...prev]);
    return { error: null };
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return { error: error.message };
    setTransactions(prev => prev.filter(t => t.id !== id));
    return { error: null };
  };

  // ═══════════════════════════════════════════════════════════════
  // AUTENTICAÇÃO
  // ═══════════════════════════════════════════════════════════════

  /** Logout: limpa a sessão no Supabase (o listener onAuthStateChange limpa os estados) */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ═══════════════════════════════════════════════════════════════
  // ESTATÍSTICAS DO DASHBOARD (cálculo em tempo real)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calcula as métricas do dashboard a partir dos dados atuais.
   * É chamado a CADA render — como os arrays são pequenos, o custo é irrelevante.
   *
   * Se os dados crescerem muito no futuro, mova isso para uma RPC no PostgreSQL.
   */
  const calculateStats = (): DashboardStats => {
    const lowStockItems = products.filter(p => p.stock < 5).length;
    const monthlyRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const estimatedProfit = Math.max(0, monthlyRevenue - totalExpenses);

    return {
      totalClients: clients.length,
      totalProducts: products.length,
      totalSales: sales.length,
      monthlyRevenue,
      estimatedProfit,
      lowStockItems,
    };
  };

  // ── RENDER DO PROVEDOR ──
  return (
    <AppContext.Provider value={{
      user,
      isLoading,
      clients,
      products,
      sales,
      transactions,
      stats: calculateStats(),        // Recalcula as métricas a cada render
      addClient, updateClient, deleteClient,
      addProduct, updateProduct, deleteProduct,
      addSale,
      addTransaction, deleteTransaction,
      signOut,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── HOOK PERSONALIZADO ──────────────────────────────────────────

/**
 * useApp() — Hook para consumir o estado global em qualquer componente.
 *
 * Uso:
 *   const { clients, addClient, stats } = useApp();
 *
 * Deve ser usado DENTRO de um componente que está envolvido pelo <AppProvider>.
 * O AppProvider está no layout.tsx raiz, então TODOS os componentes têm acesso.
 *
 * Se usado fora do AppProvider, lança um erro claro.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
