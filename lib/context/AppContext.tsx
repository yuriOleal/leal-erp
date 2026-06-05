'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, Product, Sale, Transaction, DashboardStats } from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  clients: Client[];
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
  stats: DashboardStats;
  // Client CRUD
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<{ error: string | null }>;
  updateClient: (id: string, client: Partial<Client>) => Promise<{ error: string | null }>;
  deleteClient: (id: string) => Promise<{ error: string | null }>;
  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ error: string | null }>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ error: string | null }>;
  deleteProduct: (id: string) => Promise<{ error: string | null }>;
  // Sale
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<{ error: string | null }>;
  // Transaction
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<{ error: string | null }>;
  deleteTransaction: (id: string) => Promise<{ error: string | null }>;
  // Auth
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to map Supabase snake_case rows to camelCase Client type
const mapClient = (row: Record<string, unknown>): Client => ({
  id: row.id as string,
  name: row.name as string,
  document: row.document as string,
  phone: row.phone as string,
  email: row.email as string,
  address: row.address as string,
  createdAt: (row.created_at as string).split('T')[0],
});

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

const mapTransaction = (row: Record<string, unknown>): Transaction => ({
  id: row.id as string,
  type: row.type as 'income' | 'expense',
  amount: Number(row.amount),
  description: row.description as string,
  category: row.category as string,
  date: (row.created_at as string).split('T')[0],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchAllData = useCallback(async (userId: string) => {
    const [clientsRes, productsRes, salesRes, transactionsRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('sales')
        .select('*, sale_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (clientsRes.data) setClients(clientsRes.data.map(mapClient));
    if (productsRes.data) setProducts(productsRes.data.map(mapProduct));
    if (salesRes.data) setSales(salesRes.data.map(mapSale));
    if (transactionsRes.data) setTransactions(transactionsRes.data.map(mapTransaction));
  }, [supabase]);

  const refreshData = useCallback(async () => {
    if (user) await fetchAllData(user.id);
  }, [user, fetchAllData]);

  // Monitor auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchAllData(currentUser.id);
        } else {
          setClients([]);
          setProducts([]);
          setSales([]);
          setTransactions([]);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchAllData]);

  // ── CLIENT CRUD ──────────────────────────────────────────────
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: clientData.name,
        document: clientData.document,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    setClients(prev => [mapClient(data), ...prev]);
    return { error: null };
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const updatePayload: Record<string, unknown> = {};
    if (clientData.name !== undefined) updatePayload.name = clientData.name;
    if (clientData.document !== undefined) updatePayload.document = clientData.document;
    if (clientData.phone !== undefined) updatePayload.phone = clientData.phone;
    if (clientData.email !== undefined) updatePayload.email = clientData.email;
    if (clientData.address !== undefined) updatePayload.address = clientData.address;

    const { error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', id);

    if (error) return { error: error.message };
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
    return { error: null };
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) return { error: error.message };
    setClients(prev => prev.filter(c => c.id !== id));
    return { error: null };
  };

  // ── PRODUCT CRUD ──────────────────────────────────────────────
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        purchase_price: productData.purchasePrice,
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

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

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

  // ── SALES ──────────────────────────────────────────────────────
  const addSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    if (!user) return { error: 'Usuário não autenticado.' };

    // Call the atomic RPC function on Supabase (handles stock deduction + financial entry)
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

    // Refresh data to reflect stock changes and new transaction
    await fetchAllData(user.id);
    return { error: null };
  };

  // ── TRANSACTIONS ────────────────────────────────────────────────
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

  // ── AUTH ────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ── STATS ───────────────────────────────────────────────────────
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

  return (
    <AppContext.Provider value={{
      user,
      isLoading,
      clients,
      products,
      sales,
      transactions,
      stats: calculateStats(),
      addClient,
      updateClient,
      deleteClient,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      addTransaction,
      deleteTransaction,
      signOut,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
