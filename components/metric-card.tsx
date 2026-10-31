import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MetricTone = 'green' | 'amber' | 'rose' | 'slate';

type MetricCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: MetricTone;
  className?: string;
};

const toneStyles: Record<MetricTone, { icon: string; value: string }> = {
  green: {
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    value: 'text-rose-700 dark:text-rose-300',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    value: 'text-foreground',
  },
};

// Card compacto para indicadores. A variação por tom evita telas monocromáticas
// e ajuda o usuário a identificar rapidamente saúde, alerta e risco.
export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'slate',
  className,
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-white/70 bg-card shadow-sm shadow-slate-200/60 dark:border-white/10 dark:shadow-none',
        className
      )}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className={cn('text-2xl font-bold tracking-[-0.04em]', styles.value)}>
              {value}
            </p>
          </div>
          <div className={cn('rounded-2xl p-2.5', styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
