// ================================================================
// CLIENT MODAL — Modal de Criar/Editar Cliente
//
// Abre como um dialog (popup centralizado) quando o usuário clica
// em "Novo Cliente" ou no ícone de editar na tabela de clientes.
//
// Modos de operação:
// - Criação: clientToEdit = null  → formulário em branco
// - Edição:   clientToEdit = {...} → formulário preenchido com dados existentes
//
// Validação: React Hook Form + Zod (clientSchema)
// Persistência: AppContext → Supabase
// ================================================================

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/validations/schemas';
import { useApp } from '@/lib/context/AppContext';
import { Client } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── TIPOS ────────────────────────────────────────────────────────

interface ClientModalProps {
  open: boolean;            // Controla se o modal está visível
  onOpenChange: (open: boolean) => void; // Callback para abrir/fechar
  clientToEdit?: Client | null; // Se fornecido, é modo EDIÇÃO; se null/undefined, é CRIAÇÃO
}

// O formulário NÃO inclui 'id' nem 'createdAt' — são gerados pelo banco
type ClientFormValues = Omit<Client, 'id' | 'createdAt'>;

// ─── COMPONENTE ───────────────────────────────────────────────────

export function ClientModal({ open, onOpenChange, clientToEdit }: ClientModalProps) {
  const { addClient, updateClient } = useApp(); // Funções CRUD do contexto
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Configuração do React Hook Form ──
  const {
    register,           // Registra cada input no form
    handleSubmit,       // Handler que executa validação antes de onSubmit
    reset,              // Reseta o formulário para valores iniciais
    formState: { errors }, // Erros de validação do Zod
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema), // Valida com o schema Zod
    defaultValues: {
      name: '',
      document: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  // ── Efeito: preenche o form quando o modal abre ──
  // Se for edição → carrega dados do cliente
  // Se for criação → limpa o formulário
  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        // Modo EDIÇÃO: preenche com os dados do cliente selecionado
        reset({
          name: clientToEdit.name,
          document: clientToEdit.document,
          phone: clientToEdit.phone,
          email: clientToEdit.email,
          address: clientToEdit.address,
        });
      } else {
        // Modo CRIAÇÃO: limpa todos os campos
        reset({
          name: '',
          document: '',
          phone: '',
          email: '',
          address: '',
        });
      }
    }
  }, [open, clientToEdit, reset]);

  // ── Handler de submit ──
  const onSubmit = async (data: ClientFormValues) => {
    setSubmitError(null);
    setIsSaving(true);

    try {
      const result = clientToEdit
        ? await updateClient(clientToEdit.id, data)
        : await addClient(data);

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  // ── RENDER ──
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setSubmitError(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {submitError && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {submitError}
            </p>
          )}
          {/* Campo: Nome / Razão Social */}
          <div className="space-y-1">
            <Label htmlFor="name">Nome / Razão Social</Label>
            <Input id="name" placeholder="Ex: Tech Solutions Ltda" {...register('name')} />
            {errors.name && (
              <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Linha com 2 colunas: CPF/CNPJ e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="document">CPF ou CNPJ</Label>
              <Input id="document" placeholder="Apenas números" {...register('document')} />
              {errors.document && (
                <p className="text-xs font-semibold text-destructive">{errors.document.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Telefone / Celular</Label>
              <Input id="phone" placeholder="Ex: 11999998888" {...register('phone')} />
              {errors.phone && (
                <p className="text-xs font-semibold text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Campo: Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email de Contato</Label>
            <Input id="email" type="email" placeholder="financeiro@empresa.com" {...register('email')} />
            {errors.email && (
              <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Campo: Endereço */}
          <div className="space-y-1">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input id="address" placeholder="Av. Paulista, 1000 - São Paulo, SP" {...register('address')} />
            {errors.address && (
              <p className="text-xs font-semibold text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* Botões: Cancelar | Salvar */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => { setSubmitError(null); onOpenChange(false); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : clientToEdit ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
