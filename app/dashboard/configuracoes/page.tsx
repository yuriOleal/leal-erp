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
    setIsSavingProfile(true);
    setProfileStatus(null);

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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as preferências da sua conta e do sistema</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
            <CardDescription>Informações básicas do administrador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={currentFullName} onChange={(event) => setFullNameDraft(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground">
                Alteração de email exige confirmação e deve ser tratada em um fluxo dedicado.
              </p>
            </div>
            {profileStatus && (
              <p className="text-sm font-medium text-muted-foreground">{profileStatus}</p>
            )}
            <div className="pt-4">
              <Button onClick={saveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Customize o visual do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tema do Sistema</Label>
              <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Altere sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            {securityStatus && (
              <p className="text-sm font-medium text-muted-foreground">{securityStatus}</p>
            )}
            <div className="pt-4">
              <Button variant="outline" onClick={updatePassword} disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
