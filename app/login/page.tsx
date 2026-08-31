// ================================================================
// TELA DE LOGIN / REGISTRO / RECUPERAÇÃO DE SENHA
//
// Modos disponíveis (controlados pelo state `mode`):
// - 'login':    Tela padrão — email + senha para entrar
// - 'register': Criar uma nova conta (Sign Up)
// - 'forgot':   Recuperar senha esquecida (envia link por email)
//
// Fluxo de autenticação:
// 1. Usuário preenche o formulário (validado com Zod via React Hook Form)
// 2. Os dados são enviados ao Supabase Auth (signInWithPassword / signUp / resetPasswordForEmail)
// 3. Em caso de sucesso: redireciona para /dashboard
// 4. Em caso de erro: mostra mensagem traduzida em português
// ================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations/schemas';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { BrandLogo } from '@/components/brand-logo';

// ─── TIPOS ────────────────────────────────────────────────────────

/**
 * Formato dos dados do formulário (apenas email e senha).
 * O campo "remember" não está incluso aqui pois não é usado pelo Supabase.
 */
type LoginFormValues = {
  email: string;
  password: string;
};

/**
 * Modos de operação da tela.
 */
type Mode = 'login' | 'register' | 'forgot';

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient(); // Cliente Supabase para o navegador

  // ── Estados locais ──
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar senha
  const [isLoading, setIsLoading] = useState(false);       // Loading do botão
  const [mode, setMode] = useState<Mode>('login');         // Modo atual da tela
  const [error, setError] = useState<string | null>(null); // Mensagem de erro
  const [success, setSuccess] = useState<string | null>(null); // Mensagem de sucesso

  // ── Configuração do React Hook Form com validação Zod ──
  const {
    register,           // Registra inputs no form
    handleSubmit,       // Wrapper para onSubmit com validação
    formState: { errors }, // Erros de validação de cada campo
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // Conecta o schema Zod ao form
    defaultValues: { email: '', password: '' },
  });

  // ── Tradutor de erros do Supabase para português ──
  // O Supabase retorna mensagens em inglês. Esta função converte
  // para mensagens amigáveis em português.
  const translateError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de fazer login.';
    if (msg.includes('User already registered')) return 'Este email já possui uma conta. Faça login.';
    if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
    if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
    return msg; // Se não for um erro conhecido, mostra a mensagem original
  };

  // ── Handler do formulário (login, registro ou recuperação de senha) ──
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        // 🔐 LOGIN: Autentica o usuário com email + senha
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) { setError(translateError(error.message)); return; }

        // Login bem-sucedido: redireciona para o dashboard
        router.push('/dashboard');
        router.refresh(); // Força o Next.js a revalidar os dados da página

      } else if (mode === 'register') {
        // 📝 REGISTRO: Cria uma nova conta
        // O Supabase enviará um email de confirmação automaticamente
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) { setError(translateError(error.message)); return; }

        setSuccess('Conta criada! Verifique seu email para ativar o acesso.');
        setMode('login'); // Volta para a tela de login

      } else if (mode === 'forgot') {
        // 🔄 RECUPERAÇÃO: Envia um link de reset por email
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) { setError(translateError(error.message)); return; }

        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Configuração de textos por modo ──
  const modeConfig = {
    login: {
      title: 'Entrar na plataforma',
      description: 'Insira suas credenciais para acessar o painel',
      button: 'Entrar no Painel',
      toggle: { text: 'Não tem conta?', link: 'Cadastre-se gratuitamente', to: 'register' },
    },
    register: {
      title: 'Criar sua conta',
      description: 'Preencha os dados abaixo para começar gratuitamente',
      button: 'Criar Conta',
      toggle: { text: 'Já tem uma conta?', link: 'Faça login aqui', to: 'login' },
    },
    forgot: {
      title: 'Recuperar senha',
      description: 'Enviaremos um link de redefinição para seu email',
      button: 'Enviar Link de Recuperação',
      toggle: { text: 'Lembrou a senha?', link: 'Voltar ao login', to: 'login' },
    },
  };

  const currentMode = modeConfig[mode];

  // ── RENDER ──────────────────────────────────────────────────

  return (
    <div className="grid min-h-screen bg-[#f5f1e8] lg:grid-cols-[1fr_0.92fr]">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8">

      {/* Botão Voltar para a landing page */}
      <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
        <Link href="/">
          <Button variant="ghost" className="group gap-2 text-[#68736f] hover:bg-[#e8e3d9] hover:text-[#18332c]">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Card do formulário com animação de entrada */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="z-10 w-full max-w-[430px]"
      >
        {/* Logo + nome do ERP */}
        <div className="mb-10">
          <BrandLogo />
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[#a66c22]">
            Acesso seguro
          </p>
        </div>

        <Card className="rounded-[28px] border-[#ded8cd] bg-white shadow-[0_24px_60px_rgba(18,60,50,.10)]">
          <CardHeader className="space-y-1 pb-5">
            <CardTitle className="text-2xl font-semibold tracking-[-0.035em] text-[#18332c]">{currentMode.title}</CardTitle>
            <CardDescription className="text-sm text-[#68736f]">{currentMode.description}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Alerta de erro (ex: email ou senha incorretos) */}
              {error && (
                <div className="flex items-center gap-2.5 bg-rose-900/30 border border-rose-500/30 text-rose-400 text-sm font-medium rounded-lg p-3.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Alerta de sucesso (ex: conta criada, email enviado) */}
              {success && (
                <div className="flex items-center gap-2.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg p-3.5">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Campo: Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-[#334b44]">Email corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@suaempresa.com"
                  {...register('email')}
                  className={`h-11 border-[#d7d1c6] bg-[#fbfaf6] text-[#18332c] placeholder:text-[#9aa39f] focus-visible:ring-[#1c5b4d] ${errors.email ? 'border-rose-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Campo: Senha (oculto no modo "esqueci a senha") */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm text-[#334b44]">Senha</Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(null); }}
                        className="text-xs font-semibold text-[#1c5b4d] hover:text-[#123c32]"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={`h-11 border-[#d7d1c6] bg-[#fbfaf6] pr-10 text-[#18332c] placeholder:text-[#9aa39f] focus-visible:ring-[#1c5b4d] ${errors.password ? 'border-rose-500' : ''}`}
                    />
                    {/* Botão para alternar visibilidade da senha (ícone de olho) */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8782] hover:text-[#18332c]"
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-4 pt-2">
              {/* Botão principal (Entrar / Criar conta / Enviar link) */}
              <Button
                type="submit"
                className="h-11 w-full bg-[#123c32] font-semibold text-white hover:bg-[#1c5b4d]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processando...
                  </span>
                ) : currentMode.button}
              </Button>

              {/* Link para alternar entre Login / Registro / Recuperação */}
              <p className="text-center text-sm text-[#7a8782]">
                {currentMode.toggle.text}{' '}
                <button
                  type="button"
                  onClick={() => { setMode(currentMode.toggle.to as Mode); setError(null); setSuccess(null); }}
                  className="font-semibold text-[#1c5b4d] underline underline-offset-2 hover:text-[#123c32]"
                >
                  {currentMode.toggle.link}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Termos de serviço (apenas decorativo) */}
        <p className="mt-7 text-center text-xs leading-relaxed text-[#7a8782]">
          Ao continuar, você concorda com nossos{' '}
          <Link href="/termos" className="underline underline-offset-2 hover:text-[#18332c]">Termos de Uso</Link>
          {' '}e{' '}
          <Link href="/privacidade" className="underline underline-offset-2 hover:text-[#18332c]">Política de Privacidade</Link>.
        </p>
      </motion.div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#102d27] lg:block">
        <Image
          src="/images/leal-operations-hero.png"
          alt="Operação organizada de uma pequena distribuidora"
          fill
          priority
          className="object-cover object-[70%_center]"
          sizes="45vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,45,39,.05),rgba(16,45,39,.8))]" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f0c985]">Leal ERP</p>
          <p className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em]">
            Menos tempo conferindo planilhas. Mais clareza para operar.
          </p>
        </div>
      </aside>
    </div>
  );
}
