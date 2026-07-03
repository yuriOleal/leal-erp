import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

// Cabeçalho reutilizável para as telas internas.
// Mantém título, contexto e ações sempre no mesmo padrão visual.
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none sm:flex-row sm:items-end sm:justify-between sm:p-6',
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary/75">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
