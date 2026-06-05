// ================================================================
// CLIENTE SUPABASE (LADO DO SERVIDOR)
// Usado em Server Components e no Middleware do Next.js.
// Tem acesso aos cookies para ler/escrever a sessão do usuário.
// ================================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cria uma instância do cliente Supabase para uso no servidor Next.js.
 *
 * Diferente do client.ts (navegador), este tem acesso direto aos cookies
 * da requisição HTTP, permitindo:
 *
 * 1. Ler a sessão atual do usuário (cookie de autenticação)
 * 2. Atualizar/definir cookies quando a sessão é renovada
 *
 * Usado principalmente no:
 * - middleware.ts (proteção de rotas)
 * - Server Components que precisam buscar dados antes do render
 */
export const createServerSupabaseClient = async () => {
  // cookies() é uma função do Next.js que lê os cookies da requisição atual
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lê todos os cookies da requisição para enviar ao Supabase Auth
        getAll() {
          return cookieStore.getAll();
        },
        // Define novos cookies (ex: quando o token de acesso é renovado)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se for chamado de um Server Component, não pode definir cookies.
            // Isso é seguro ignorar — o middleware cuida da renovação da sessão.
          }
        },
      },
    }
  );
};
