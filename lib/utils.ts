// ================================================================
// UTILITÁRIOS (Funções auxiliares reutilizáveis)
// ================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS condicionalmente, resolvendo conflitos do Tailwind.
 *
 * Exemplo de uso:
 *   cn('text-red-500', isActive && 'text-blue-500', className)
 *   // Se isActive for true, 'text-blue-500' sobrescreve 'text-red-500'
 *
 * O twMerge resolve conflitos de classes Tailwind (a última ganha),
 * enquanto o clsx permite condicionais limpos (booleanos, objetos, arrays).
 *
 * Usado em TODOS os componentes UI do Shadcn e nos componentes customizados.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
