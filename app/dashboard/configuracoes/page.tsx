'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/lib/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/page-header';
import { BrandLogo } from '@/components/brand-logo';
import { Moon, Palette, ShieldCheck, Sun, UserRound } from 'lucide-react';

export default function ConfiguracoesPage() {
  const { setTheme, theme } = useTheme();
  const { user } = useApp();
  const supabase = createClient();

  const [fullNameDraft, setFullNameDraft] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Nome exibido no formulário. Enquanto o usuário não digita nada, usamos
  // os dados reais vindos do Supabase Auth; depois, usamos o rascunho local.
  const currentFullName = fullNameDraft ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '';

  const saveProfile = async () => {
    setProfileStatus(null);

    if (!currentFullName.trim()) {
      setProfileStatus('Informe um nome para salvar o perfil.');
      return;
    }

    setIsSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: currentFullName.trim() },
    });

    setProfileStatus(error ? `Erro ao salvar perfil: ${error.message}` : 'Perfil atualizado com sucesso.');
    setIsSavingProfile(false);
  };

  const updatePassword = async () => {
    setSecurityStatus(null);

    if (newPassword.length < 6) {
      setSecurityStatus('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityStatus('A confirmação de senha não confere.');
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setSecurityStatus(`Erro ao atualizar senha: ${error.message}`);
    } else {
      setSecurityStatus('Senha atualizada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsUpdatingPassword(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Configurações"
        description="Ajuste perfil, aparência e segurança da conta conectada ao Supabase."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-white/70 bg-[#123c32] text-white shadow-xl shadow-emerald-950/10 dark:border-white/10">
          <CardContent className="space-y-6 p-6">
            <BrandLogo inverted />
            <div className="space-y-2">
              <p className="text-2xl font-bold tracking-[-0.04em]">Conta administrativa</p>
              <p className="text-sm leading-6 text-white/70">
                Este painel guarda preferências do usuário logado. Dados operacionais continuam separados por autenticação.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Usuário conectado</p>
              <p className="mt-2 truncate text-sm font-semibold">{user?.email ?? 'Carregando...'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Perfil do usuário</CardTitle>
                  <CardDescription>Informações básicas do administrador.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" value={currentFullName} onChange={(event) => setFullNameDraft(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email ?? ''} disabled />
                <p className="text-xs leading-5 text-muted-foreground">
                  Alteração de email exige confirmação e deve ficar em um fluxo dedicado.
                </p>
              </div>
              {profileStatus && (
                <p className="rounded-xl bg-muted p-3 text-sm font-medium text-muted-foreground">{profileStatus}</p>
              )}
              <Button onClick={saveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Tema visual do sistema.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tema do sistema</Label>
                  <Select value={theme ?? 'system'} onValueChange={(value) => value && setTheme(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <span className="inline-flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="inline-flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Escuro
                        </span>
                      </SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Atualize a senha de acesso.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                {securityStatus && (
                  <p className="rounded-xl bg-muted p-3 text-sm font-medium text-muted-foreground">{securityStatus}</p>
                )}
                <Button variant="outline" onClick={updatePassword} disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? 'Atualizando...' : 'Atualizar senha'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
