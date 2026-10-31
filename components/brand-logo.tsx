import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
};

// Marca vetorial do Leal ERP.
// O símbolo combina um "L" estrutural com linhas de registro, remetendo
// a controle operacional sem cair no clichê de seta/gráfico genérico.
export function BrandLogo({ className, compact = false, inverted = false }: BrandLogoProps) {
  const markFill = inverted ? '#F7F0E4' : '#102D27';
  const mainStroke = inverted ? '#102D27' : '#F7F0E4';
  const accentStroke = inverted ? '#B97924' : '#E8A84C';

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <svg
        aria-label="Leal ERP"
        className="h-10 w-10 shrink-0"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="44" height="44" rx="14" fill={markFill} />
        <path
          d="M14 11.5V28.7C14 31.63 16.37 34 19.3 34H31.5"
          stroke={mainStroke}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.5 15.2H32.2"
          stroke={accentStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M22.5 21.8H30"
          stroke={accentStroke}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M22.5 28.4H35"
          stroke={accentStroke}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.84"
        />
      </svg>

      {!compact && (
        <div className="leading-none">
          <span
            className={cn(
              'flex items-baseline gap-1.5 text-lg font-bold tracking-[-0.035em]',
              inverted ? 'text-white' : 'text-[#17352d]'
            )}
          >
            Leal
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-[0.12em]',
                inverted ? 'bg-white/10 text-[#f0c985]' : 'bg-[#102d27]/10 text-[#8a5516]'
              )}
            >
              ERP
            </span>
          </span>
          <span
            className={cn(
              'mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em]',
              inverted ? 'text-white/55' : 'text-[#65746f]'
            )}
          >
            gestão empresarial
          </span>
        </div>
      )}
    </div>
  );
}
