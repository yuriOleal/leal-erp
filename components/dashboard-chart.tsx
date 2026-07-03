'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '@/lib/formatters';

type ChartDataPoint = {
  name: string;
  revenue: number;
  expenses: number;
};

interface DashboardChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line';
}

const tooltipStyle = {
  borderRadius: '16px',
  border: '1px solid var(--border)',
  boxShadow: '0 18px 45px rgb(15 23 42 / 0.12)',
  background: 'var(--card)',
  color: 'var(--card-foreground)',
};

// Componente isolado para os gráficos do dashboard.
// Ele é carregado dinamicamente sem SSR, porque o Recharts depende do tamanho
// real do container no navegador e costuma gerar avisos durante o build estático.
export function DashboardChart({ data, type }: DashboardChartProps) {
  const commonAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: 'var(--muted-foreground)', fontSize: 12 },
  };

  const tooltipFormatter = (value: unknown, name: unknown) => {
    const labels: Record<string, string> = {
      revenue: 'Receitas',
      expenses: 'Despesas',
    };

    return [
      formatCurrency(Number(value ?? 0)),
      labels[String(name)] ?? 'Saldo',
    ] as [string, string];
  };

  if (type === 'line') {
    const lineData = data.map(item => ({
      ...item,
      balance: item.revenue - item.expenses,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 16, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="name" {...commonAxisProps} />
          <YAxis
            {...commonAxisProps}
            width={72}
            tickFormatter={(value) => formatCompactCurrency(Number(value))}
          />
          <RechartsTooltip
            contentStyle={tooltipStyle}
            cursor={{ stroke: 'var(--primary)', strokeDasharray: '4 4' }}
            formatter={(value) => [formatCurrency(Number(value)), 'Saldo']}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Saldo"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
        <XAxis dataKey="name" {...commonAxisProps} />
        <YAxis
          {...commonAxisProps}
          width={72}
          tickFormatter={(value) => formatCompactCurrency(Number(value))}
        />
        <RechartsTooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
          contentStyle={tooltipStyle}
          formatter={tooltipFormatter}
        />
        <Bar dataKey="revenue" name="Receitas" fill="var(--primary)" radius={[8, 8, 0, 0]} />
        <Bar dataKey="expenses" name="Despesas" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
