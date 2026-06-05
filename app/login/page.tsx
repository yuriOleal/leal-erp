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

type LoginFormValues = {
  email: string;
  password: string;
};

type Mode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const translateError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de fazer login.';
    if (msg.includes('User already registered')) return 'Este email já possui uma conta. Faça login.';
    if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
    if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
    return msg;
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) { setError(translateError(error.message)); return; }
        router.push('/dashboard');
        router.refresh();
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) { setError(translateError(error.message)); return; }
        setSuccess('Conta criada! Verifique seu email para ativar o acesso.');
        setMode('login');
      } else if (mode === 'forgot') {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      {/* Back to Home */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Button variant="ghost" className="gap-2 group text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-2xl shadow-indigo-600/30"
          >
            <span className="text-2xl font-black">L</span>
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Leal ERP</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Gestão inteligente para sua empresa</p>
        </div>

        <Card className="border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-5">
            <CardTitle className="text-xl font-bold tracking-tight text-white">{currentMode.title}</CardTitle>
            <CardDescription className="text-slate-400 text-sm">{currentMode.description}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Error/Success messages */}
              {error && (
                <div className="flex items-center gap-2.5 bg-rose-900/30 border border-rose-500/30 text-rose-400 text-sm font-medium rounded-lg p-3.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg p-3.5">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-sm">Email corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@suaempresa.com"
                  {...register('email')}
                  className={`bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.email ? 'border-rose-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password (hidden on forgot mode) */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 text-sm">Senha</Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(null); }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
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
                      className={`bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-600 pr-10 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 ${errors.password ? 'border-rose-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 py-5 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processando...
                  </span>
                ) : currentMode.button}
              </Button>

              {/* Mode toggle */}
              <p className="text-sm text-slate-500 text-center">
                {currentMode.toggle.text}{' '}
                <button
                  type="button"
                  onClick={() => { setMode(currentMode.toggle.to as Mode); setError(null); setSuccess(null); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                >
                  {currentMode.toggle.link}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-600 leading-relaxed">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="underline underline-offset-2 hover:text-slate-400">Termos de Serviço</a>
          {' '}e{' '}
          <a href="#" className="underline underline-offset-2 hover:text-slate-400">Política de Privacidade</a>.
        </p>
      </motion.div>
    </div>
  );
}
