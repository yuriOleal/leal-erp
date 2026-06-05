// ================================================================
// TRANSACTION MODAL — Modal de Lançamento Financeiro
//
// Permite registrar uma entrada (receita) ou saída (despesa) no fluxo
// de caixa. O usuário escolhe:
// - Tipo: Receita (income) ou Despesa (expense)
// - Valor em reais
// - Descrição (ex: "Pagamento de fornecedor")
// - Categoria (varia conforme o tipo selecionado)
//
// As categorias mudam dinamicamente:
// - Receitas: Vendas, Serviços, Investimentos, Outros
// - Despesas: Aluguel, RH, Contas Fixas, Marketing, Logística, Outros
// ================================================================

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/lib/validations/schemas';
import { useApp } from '@/lib/context/AppContext';
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

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TransactionFormValues = {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
};

// Categorias disponíveis separadas por tipo de transação
const CATEGORIES = {
  income: ['Vendas', 'Serviços', 'Investimentos', 'Outros'],
  expense: ['Aluguel', 'RH', 'Contas Fixas', 'Marketing', 'Logística', 'Outros']
};

export function TransactionModal({ open, onOpenChange }: TransactionModalProps) {
  const { addTransaction } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    watch,       // Observa o valor atual de um campo (reativo)
    setValue,    // Define o valor de um campo programaticamente
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      amount: 0,
      description: '',
      category: '',
    },
  });

  const watchedType = watch('type'); // Observa mudanças no tipo (income/expense)

  // Reseta o formulário quando o modal abre
  useEffect(() => {
    if (open) {
      reset({ type: 'income', amount: 0, description: '', category: '' });
    }
  }, [open, reset]);

  // Quando o usuário muda o tipo (receita ↔ despesa), limpa a categoria
  // porque as opções de categoria são diferentes para cada tipo
  useEffect(() => {
    setValue('category', '');
  }, [watchedType, setValue]);

  const onSubmit = (data: TransactionFormValues) => {
    addTransaction(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Registrar Lançamento Financeiro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Tipo: Receita ou Despesa */}
          <div className="space-y-1">
            <Label htmlFor="type">Tipo de Lançamento</Label>
            <select
              id="type"
              {...register('type')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="income">Receita (Entrada)</option>
              <option value="expense">Despesa (Saída)</option>
            </select>
          </div>

          {/* Valor em reais */}
          <div className="space-y-1">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs font-semibold text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Descrição do lançamento */}
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Ex: Licença mensal de software" {...register('description')} />
            {errors.description && (
              <p className="text-xs font-semibold text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Categoria (opções mudam conforme o tipo selecionado) */}
          <div className="space-y-1">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              {...register('category')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione uma categoria...</option>
              {CATEGORIES[watchedType].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs font-semibold text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Botões */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar Lançamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
