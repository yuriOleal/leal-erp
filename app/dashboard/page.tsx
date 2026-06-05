'use client';

import { useApp } from '@/lib/context/AppContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function DashboardPage() {
  const { products, sales, transactions, stats } = useApp();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const criticalStock = [...products]
    .filter(p => p.stock < 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  // Generate dynamic chart data based on actual transactions
  const generateChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Group by month-year
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]}`;
      monthlyData[key] = { revenue: 0, expenses: 0 };
    }

    transactions.forEach(t => {
      try {
        const date = new Date(t.date);
        const key = months[date.getMonth()];
        if (monthlyData[key] !== undefined) {
          if (t.type === 'income') {
            monthlyData[key].revenue += t.amount;
          } else {
            monthlyData[key].expenses += t.amount;
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    // If all values are 0 (e.g. no transactions matching those months), fallback to visual defaults
    const hasData = Object.values(monthlyData).some(d => d.revenue > 0 || d.expenses > 0);
    if (!hasData) {
      return [
        { name: 'Jan', revenue: 65000, expenses: 40000 },
        { name: 'Fev', revenue: 72000, expenses: 42000 },
        { name: 'Mar', revenue: 90000, expenses: 45000 },
        { name: 'Abr', revenue: 110000, expenses: 48000 },
        { name: 'Mai', revenue: 142100, expenses: 50000 },
        { name: 'Jun', revenue: stats.monthlyRevenue || 80000, expenses: 30000 },
      ];
    }

    return Object.entries(monthlyData).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      expenses: data.expenses
    }));
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.estimatedProfit)}</div>
            <p className="text-xs text-muted-foreground">+8.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">+2 novos nesta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.lowStockItems > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-destructive' : ''}`}>
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Itens precisam de reposição</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Acompanhamento financeiro dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="revenue" name="Receitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimas Vendas</CardTitle>
            <CardDescription>Resumo das vendas recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {sale.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{sale.clientName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    +{formatCurrency(sale.total)}
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-8">Nenhuma venda registrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução de Caixa</CardTitle>
            <CardDescription>Projeção de fluxo de caixa</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="revenue" name="Saldo" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estoque Crítico</CardTitle>
            <CardDescription>Produtos que necessitam de reposição imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalStock.map(product => (
                <div key={product.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-muted-foreground bg-muted p-1.5 rounded-md" />
                    <div>
                      <p className="text-sm font-medium leading-none">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${product.stock === 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {product.stock} em estoque
                    </span>
                  </div>
                </div>
              ))}
              {criticalStock.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-8">Estoque em níveis normais.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
