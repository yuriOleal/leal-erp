'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { MetricCard } from '@/components/metric-card';
import { PageHeader } from '@/components/page-header';
import { formatCurrency, formatDate, isInCurrentMonth } from '@/lib/formatters';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Circle,
  DollarSign,
  Package,
  PackagePlus,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardChart = dynamic(
  () => import('@/components/dashboard-chart').then(module => module.DashboardChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-muted/60" />,
  }
);

type MonthlyData = {
  name: string;
  revenue: number;
  expenses: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const { clients, products, sales, transactions, stats, isLoading } = useApp();

  const recentSales = useMemo(() => (
    [...sales]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  ), [sales]);

  const criticalStock = useMemo(() => (
    [...products]
      .filter(product => product.stock < 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
  ), [products]);

  const chartData = useMemo<MonthlyData[]>(() => {
    const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const buckets = new Map<string, MonthlyData>();
    const now = new Date();

    // Monta os últimos 6 meses antes de somar os lançamentos,
    // assim o gráfico mantém largura estável mesmo quando não há dados.
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = monthLabel.format(date).replace('.', '');

      buckets.set(key, {
        name: label.charAt(0).toUpperCase() + label.slice(1),
        revenue: 0,
        expenses: 0,
      });
    }

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = buckets.get(key);
      if (!bucket) return;

      if (transaction.type === 'income') {
        bucket.revenue += transaction.amount;
      } else {
        bucket.expenses += transaction.amount;
      }
    });

    return Array.from(buckets.values());
  }, [transactions]);

  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'expense' && isInCurrentMonth(transaction.date))
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = stats.monthlyRevenue - totalExpenses;
  const averageTicket = sales.length
    ? sales.reduce((total, sale) => total + sale.total, 0) / sales.length
    : 0;
  const inventoryValue = products.reduce(
    (total, product) => total + product.stock * product.purchasePrice,
    0
  );
  const hasFinancialData = chartData.some(item => item.revenue > 0 || item.expenses > 0);

  const setupSteps = [
    {
      title: 'Cadastrar clientes',
      description: 'Monte a carteira para registrar vendas com histórico.',
      done: clients.length > 0,
      href: '/dashboard/clientes',
    },
    {
      title: 'Cadastrar produtos',
      description: 'Organize catálogo, preço, custo e fornecedor.',
      done: products.length > 0,
      href: '/dashboard/produtos',
    },
    {
      title: 'Registrar primeira venda',
      description: 'Valide o fluxo comercial e a baixa de estoque.',
      done: sales.length > 0,
      href: '/dashboard/vendas',
    },
    {
      title: 'Acompanhar financeiro',
      description: 'Veja receitas, despesas e saldo do período.',
      done: transactions.length > 0,
      href: '/dashboard/financeiro',
    },
  ];

  const completedSteps = setupSteps.filter(step => step.done).length;
  const setupProgress = Math.round((completedSteps / setupSteps.length) * 100);

  const priorityActions = [
    stats.lowStockItems > 0 && {
      title: `${stats.lowStockItems} item(ns) com estoque baixo`,
      description: 'Priorize reposição antes de novas vendas.',
      href: '/dashboard/estoque',
      tone: 'rose',
    },
    products.length === 0 && {
      title: 'Cadastre o catálogo inicial',
      description: 'Produtos são a base para vendas, estoque e relatórios.',
      href: '/dashboard/produtos',
      tone: 'amber',
    },
    clients.length === 0 && {
      title: 'Inclua seus primeiros clientes',
      description: 'Isso melhora histórico comercial e relatórios.',
      href: '/dashboard/clientes',
      tone: 'green',
    },
    sales.length === 0 && products.length > 0 && {
      title: 'Faça a primeira venda',
      description: 'Teste o fluxo completo do ERP com dados reais.',
      href: '/dashboard/vendas',
      tone: 'green',
    },
  ].filter(Boolean) as Array<{
    title: string;
    description: string;
    href: string;
    tone: 'green' | 'amber' | 'rose';
  }>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel de operação"
        title="Dashboard"
        description="Acompanhe vendas, caixa, clientes e estoque com foco no que precisa de atenção agora."
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/dashboard/produtos')}>
              <PackagePlus className="h-4 w-4" />
              Produto
            </Button>
            <Button onClick={() => router.push('/dashboard/vendas')}>
              <ShoppingCart className="h-4 w-4" />
              Nova venda
            </Button>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="relative overflow-hidden border-emerald-950/10 bg-[#123c32] text-white shadow-lg shadow-emerald-950/10 dark:border-white/10">
          <CardContent className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />
                {isLoading ? 'Sincronizando dados' : 'Dados conectados ao seu ambiente'}
              </div>
              <div className="space-y-2">
                <h2 className="max-w-2xl text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
                  Sua operação em uma visão clara, sem métricas inventadas.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-white/70">
                  O Leal ERP cruza os cadastros reais de clientes, produtos, vendas e financeiro para orientar a rotina do negócio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 text-sm backdrop-blur sm:min-w-[330px]">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/55">Saldo atual</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(balance)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/55">Ticket médio</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(averageTicket)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/55">Valor em estoque</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(inventoryValue)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/55">Vendas</p>
                <p className="mt-2 text-xl font-bold">{stats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/75 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
          <CardHeader>
            <CardTitle>Próximas ações</CardTitle>
            <CardDescription>Prioridades geradas a partir dos dados atuais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityActions.length > 0 ? (
              priorityActions.map(action => (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="group flex w-full items-start justify-between gap-3 rounded-2xl border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md dark:border-white/10"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{action.title}</p>
                    <p className="text-xs leading-5 text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 transition group-hover:translate-x-0.5',
                      action.tone === 'rose' && 'text-rose-500',
                      action.tone === 'amber' && 'text-amber-500',
                      action.tone === 'green' && 'text-emerald-600'
                    )}
                  />
                </button>
              ))
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Operação sem alertas críticos"
                description="Continue acompanhando vendas, estoque e lançamentos para manter os indicadores atualizados."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Receita"
          value={formatCurrency(stats.monthlyRevenue)}
          description="Entradas registradas no mês atual."
          icon={DollarSign}
          tone="green"
        />
        <MetricCard
          label="Lucro estimado"
          value={formatCurrency(stats.estimatedProfit)}
          description="Receitas menos despesas do mês atual."
          icon={TrendingUp}
          tone={stats.estimatedProfit > 0 ? 'green' : 'slate'}
        />
        <MetricCard
          label="Clientes"
          value={stats.totalClients}
          description="Carteira cadastrada na conta."
          icon={Users}
          tone="slate"
        />
        <MetricCard
          label="Estoque baixo"
          value={stats.lowStockItems}
          description="Itens abaixo do nível de segurança."
          icon={AlertTriangle}
          tone={stats.lowStockItems > 0 ? 'rose' : 'green'}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Receitas vs despesas</CardTitle>
              <CardDescription>Acompanhamento financeiro dos últimos 6 meses.</CardDescription>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Receitas
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Despesas
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {hasFinancialData ? (
                <DashboardChart data={chartData} type="bar" />
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Sem movimentação financeira ainda"
                  description="Registre uma venda ou lançamento financeiro para o gráfico ganhar vida."
                  action={
                    <Button size="sm" onClick={() => router.push('/dashboard/financeiro')}>
                      Registrar lançamento
                    </Button>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
          <CardHeader>
            <CardTitle>Implantação</CardTitle>
            <CardDescription>{completedSteps} de {setupSteps.length} etapas concluídas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all"
                style={{ width: `${setupProgress}%` }}
              />
            </div>

            <div className="space-y-2">
              {setupSteps.map(step => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => router.push(step.href)}
                  className="flex w-full items-start gap-3 rounded-2xl p-2 text-left transition hover:bg-muted/70"
                >
                  {step.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <span>
                    <span className="block text-sm font-semibold">{step.title}</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
        <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
          <CardHeader>
            <CardTitle>Evolução de caixa</CardTitle>
            <CardDescription>Saldo líquido por mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              {hasFinancialData ? (
                <DashboardChart data={chartData} type="line" />
              ) : (
                <EmptyState
                  icon={Wallet}
                  title="Caixa aguardando dados"
                  description="O saldo aparecerá quando houver receitas ou despesas registradas."
                  className="py-6"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
          <CardHeader>
            <CardTitle>Últimas vendas</CardTitle>
            <CardDescription>Pedidos registrados mais recentemente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSales.length > 0 ? (
              recentSales.map(sale => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => router.push('/dashboard/vendas')}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl p-2 text-left transition hover:bg-muted/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                      {sale.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{sale.clientName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(sale.total)}
                    </p>
                    <p className="text-xs text-muted-foreground group-hover:text-primary">Ver venda</p>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="Nenhuma venda registrada"
                description="Quando a primeira venda entrar, ela aparecerá aqui com cliente, data e valor."
                action={
                  <Button size="sm" onClick={() => router.push('/dashboard/vendas')}>
                    Criar venda
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
          <CardHeader>
            <CardTitle>Estoque crítico</CardTitle>
            <CardDescription>Produtos que merecem reposição.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalStock.length > 0 ? (
              criticalStock.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => router.push('/dashboard/estoque')}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-card p-3 text-left transition hover:border-amber-400/60 hover:bg-amber-50/60 dark:border-white/10 dark:hover:bg-amber-500/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-2xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
                      product.stock === 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                    )}
                  >
                    {product.stock} un.
                  </span>
                </button>
              ))
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Estoque em nível saudável"
                description="Nenhum produto está abaixo do limite crítico de 5 unidades."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
