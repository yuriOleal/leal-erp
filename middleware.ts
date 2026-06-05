// ================================================================
// MIDDLEWARE DO NEXT.JS — Proteção de Rotas
//
// Este arquivo é executado em TODA requisição antes da página renderizar.
// Ele fica na raiz do projeto (fora de /app) e é carregado pelo Edge Runtime.
//
// Funções:
// 1. Bloqueia acesso a /dashboard/* para usuários NÃO autenticados
//    → redireciona para /login
// 2. Redireciona usuários logados de /login para /dashboard
//    → evita que alguém logado veja a tela de login
// 3. Renova automaticamente a sessão do Supabase via cookies
// ================================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Cria uma resposta base que podemos modificar
  let supabaseResponse = NextResponse.next({ request });

  // ── Configura o cliente Supabase para o servidor ──
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lê os cookies da requisição atual
        getAll() {
          return request.cookies.getAll();
        },
        // Define cookies na resposta (ex: ao renovar token de acesso)
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── Verifica se o usuário está autenticado ──
  // getUser() valida o token JWT nos cookies e retorna o usuário (ou null)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── REGRA 1: Proteger rotas do dashboard ──
  // Se a URL começa com /dashboard e NÃO tem usuário logado:
  // redireciona para a tela de login
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ── REGRA 2: Evitar tela de login para quem já está logado ──
  // Se o usuário está logado e tenta acessar /login:
  // redireciona direto para o dashboard
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Se passou pelas regras, segue a requisição normalmente
  return supabaseResponse;
}

// ── Matcher: Em quais rotas o middleware deve executar ──
// Limitamos a /dashboard e /login para não rodar em rotas públicas
// como a landing page (/), arquivos estáticos, imagens, etc.
export const config = {
  matcher: [
    '/dashboard/:path*',  // Todas as sub-rotas do dashboard
    '/login',              // Apenas a rota de login
  ],
};
