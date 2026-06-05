import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/lib/context/AppContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Leal ERP',
  description: 'Modern SaaS ERP for small and medium businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppProvider>
            <TooltipProvider delay={0}>
              {children}
            </TooltipProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
