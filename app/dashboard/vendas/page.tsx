'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { Sale } from '@/types';
import { Search, Plus, MoreHorizontal, FileText, CheckCircle, Clock, ShoppingCart, ReceiptText, TimerReset, WalletCards } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SaleModal } from '@/components/modals/sale-modal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function VendasPage() {
  const { sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sales;

    return sales.filter(sale =>
      sale.clientName.toLowerCase().includes(query) ||
      sale.id.toLowerCase().includes(query)
    );
  }, [sales, searchTerm]);

  const totalSalesAmount = sales.reduce((total, sale) => total + sale.total, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const pendingSales = sales.filter(sale => sale.status === 'pending').length;
  const averageTicket = sales.length ? totalSalesAmount / sales.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comercial"
        title="Vendas"
        description="Registre pedidos, acompanhe status e consulte os detalhes de cada venda em poucos cliques."
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova venda
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total vendido"
          value={formatCurrency(totalSalesAmount)}
          description="Soma de todas as vendas registradas."
          icon={WalletCards}
          tone="green"
        />
        <MetricCard
          label="Ticket médio"
          value={formatCurrency(averageTicket)}
          description="Valor médio por pedido."
          icon={ReceiptText}
          tone="slate"
        />
        <MetricCard
          label="Concluídas"
          value={completedSales}
          description="Vendas finalizadas no histórico."
          icon={CheckCircle}
          tone="green"
        />
        <MetricCard
          label="Pendentes"
          value={pendingSales}
          description="Pedidos que ainda merecem acompanhamento."
          icon={TimerReset}
          tone={pendingSales > 0 ? 'amber' : 'slate'}
        />
      </div>

      <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente ou ID da venda..."
                className="h-10 rounded-xl bg-background pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {filteredSales.length} de {sales.length} venda(s)
            </p>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venda</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell className="font-semibold">{sale.clientName}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${sale.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
                      {sale.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {sale.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(sale.total)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-accent hover:text-accent-foreground">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSale(sale)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={ShoppingCart}
                      title={sales.length === 0 ? 'Nenhuma venda registrada' : 'Nenhuma venda encontrada'}
                      description={
                        sales.length === 0
                          ? 'Crie a primeira venda para movimentar estoque, financeiro e relatórios automaticamente.'
                          : 'Tente buscar por outro cliente ou identificador.'
                      }
                      action={
                        sales.length === 0 ? (
                          <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            Criar venda
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

      <SaleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <Dialog open={Boolean(selectedSale)} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>Venda #{selectedSale?.id.slice(0, 8).toUpperCase()}</DialogTitle>
            <DialogDescription>
              {selectedSale?.clientName} • {selectedSale ? formatDate(selectedSale.date) : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSale?.products.map((product, index) => (
                  <TableRow key={`${product.productId}-${index}`}>
                    <TableCell className="font-semibold">{product.name}</TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(product.quantity * product.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-4 font-bold text-primary">
            <span>Total da venda</span>
            <span>{selectedSale ? formatCurrency(selectedSale.total) : formatCurrency(0)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
