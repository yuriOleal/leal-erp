// ================================================================
// CLIENTE SUPABASE (LADO DO NAVEGADOR)
// Usado em componentes "use client" para fazer chamadas ao banco.
// ================================================================

import { createBrowserClient } from '@supabase/ssr';

// Estas variáveis vêm do arquivo .env.local (NUNCA são expostas no GitHub)
// NEXT_PUBLIC_ significa que são injetadas no bundle do navegador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cria uma instância do cliente Supabase para uso no navegador.
 *
 * A "anon key" (chave anônima) é segura para expor publicamente porque
 * o Row Level Security (RLS) do PostgreSQL garante que cada usuário
 * só pode acessar/modificar seus próprios dados.
 *
 * Esta função segue o padrão Singleton simplificado — cada chamada retorna
 * um novo cliente, mas o Supabase faz cache interno da sessão.
 */
export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);
