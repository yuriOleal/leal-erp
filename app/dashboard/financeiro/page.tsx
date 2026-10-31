'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { TrendingUp, TrendingDown, Wallet, Plus, MoreHorizontal, Trash2, ReceiptText, Search, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/page-header';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency, formatDate } from '@/lib/formatters';

function FinanceiroPageContent() {
  const { transactions, deleteTransaction } = useApp();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('busca') ?? '');

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query)
    );
  }, [transactions, searchTerm]);

  const totalIncome = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento financeiro?')) return;

    const result = await deleteTransaction(id);
    setErrorMsg(result.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Caixa"
        title="Financeiro"
        description="Acompanhe entradas, saídas, saldo e lançamentos para manter a saúde financeira visível."
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Registrar lançamento
          </Button>
        }
      />

      {errorMsg && (
        <p className="rounded-2xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {errorMsg}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Saldo atual"
          value={formatCurrency(balance)}
          description="Resultado acumulado dos lançamentos."
          icon={Wallet}
          tone={balance >= 0 ? 'green' : 'rose'}
        />
        <MetricCard
          label="Receitas"
          value={formatCurrency(totalIncome)}
          description="Total de entradas registradas."
          icon={TrendingUp}
          tone="green"
        />
        <MetricCard
          label="Despesas"
          value={formatCurrency(totalExpense)}
          description="Total de saídas registradas."
          icon={TrendingDown}
          tone={totalExpense > 0 ? 'amber' : 'slate'}
        />
        <MetricCard
          label="Lançamentos"
          value={transactions.length}
          description="Movimentações no histórico."
          icon={ReceiptText}
          tone="slate"
        />
      </div>

      <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Histórico financeiro</CardTitle>
              <CardDescription>Fluxo de caixa recente com receitas e despesas.</CardDescription>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por descrição ou categoria..."
                className="h-10 rounded-xl bg-background pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="font-semibold">{transaction.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-accent hover:text-accent-foreground">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Landmark}
                      title={transactions.length === 0 ? 'Nenhum lançamento financeiro' : 'Nenhum lançamento encontrado'}
                      description={
                        transactions.length === 0
                          ? 'Registre receitas e despesas para acompanhar saldo, lucro e fluxo de caixa.'
                          : 'Tente buscar por outra descrição ou categoria.'
                      }
                      action={
                        transactions.length === 0 ? (
                          <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            Registrar lançamento
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

export default function FinanceiroPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted/60" />}>
      <FinanceiroPageContent />
    </Suspense>
  );
}
