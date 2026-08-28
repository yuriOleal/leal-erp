'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { AlertTriangle, TrendingDown, ArrowUpRight, ArrowDownRight, PackageSearch, Boxes, Wallet, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency } from '@/lib/formatters';

export default function EstoquePage() {
  const { products, adjustStock } = useApp();

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const stockItems = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
    const query = searchTerm.trim().toLowerCase();

    if (!query) return sortedProducts;

    return sortedProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  const totalUnits = products.reduce((total, product) => total + product.stock, 0);
  const inventoryValue = products.reduce(
    (total, product) => total + product.stock * product.purchasePrice,
    0
  );
  const outOfStockCount = products.filter(product => product.stock === 0).length;
  const criticalCount = products.filter(product => product.stock > 0 && product.stock < 5).length;

  const handleOpenAdjust = (type: 'in' | 'out') => {
    setAdjustType(type);
    setSelectedProductId('');
    setAdjustQty(1);
    setErrorMsg('');
    setIsAdjustOpen(true);
  };

  const handleAdjustStock = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');

    if (!selectedProductId) {
      setErrorMsg('Selecione um produto.');
      return;
    }

    const product = products.find(item => item.id === selectedProductId);
    if (!product) {
      setErrorMsg('Produto não encontrado.');
      return;
    }

    if (adjustQty <= 0) {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }

    if (adjustType === 'out' && product.stock < adjustQty) {
      setErrorMsg(`Quantidade insuficiente no estoque. Disponível: ${product.stock} unidades.`);
      return;
    }

    // O banco atualiza estoque, histórico e (na entrada) financeiro dentro da
    // mesma transação. Assim não existe risco de uma metade ser gravada.
    const result = await adjustStock(product.id, adjustType, adjustQty);
    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    setIsAdjustOpen(false);
  };

  const stockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        label: 'Esgotado',
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
      };
    }

    if (stock < 5) {
      return {
        label: 'Crítico',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
      };
    }

    return {
      label: 'Normal',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventário"
        title="Estoque"
        description="Monitore posição atual, itens críticos e movimentações manuais sem perder consistência financeira."
        actions={
          <>
            <Button
              variant="outline"
              className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
              onClick={() => handleOpenAdjust('out')}
            >
              <ArrowDownRight className="h-4 w-4" />
              Registrar saída
            </Button>
            <Button onClick={() => handleOpenAdjust('in')}>
              <ArrowUpRight className="h-4 w-4" />
              Registrar entrada
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Unidades"
          value={totalUnits}
          description="Quantidade total em estoque."
          icon={Boxes}
          tone="slate"
        />
        <MetricCard
          label="Valor em estoque"
          value={formatCurrency(inventoryValue)}
          description="Custo estimado das unidades atuais."
          icon={Wallet}
          tone="green"
        />
        <MetricCard
          label="Esgotados"
          value={outOfStockCount}
          description="Itens sem disponibilidade."
          icon={TrendingDown}
          tone={outOfStockCount > 0 ? 'rose' : 'green'}
        />
        <MetricCard
          label="Críticos"
          value={criticalCount}
          description="Produtos abaixo de 5 unidades."
          icon={AlertTriangle}
          tone={criticalCount > 0 ? 'amber' : 'green'}
        />
      </div>

      <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Posição de estoque</CardTitle>
              <CardDescription>Itens ordenados por menor quantidade disponível.</CardDescription>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por produto, SKU ou fornecedor..."
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
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item) => {
                const status = stockStatus(item.stock);

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-center font-mono font-semibold">{item.stock}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {stockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={PackageSearch}
                      title={products.length === 0 ? 'Nenhum produto no estoque' : 'Nenhum item encontrado'}
                      description={
                        products.length === 0
                          ? 'Cadastre produtos para começar a controlar entrada, saída e valor parado em estoque.'
                          : 'Tente buscar por outro nome, SKU ou fornecedor.'
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>
              {adjustType === 'in' ? 'Registrar entrada de estoque' : 'Registrar saída de estoque'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustStock} className="space-y-4 py-2">
            {errorMsg && (
              <p className="rounded-xl bg-destructive/10 p-3 text-xs font-bold text-destructive">{errorMsg}</p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="adjustProduct">Produto</Label>
              <select
                id="adjustProduct"
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">Selecione um produto...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Atual: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjustQty">Quantidade</Label>
              <Input
                id="adjustQty"
                type="number"
                min="1"
                value={adjustQty}
                onChange={(event) => setAdjustQty(Number(event.target.value))}
              />
              {adjustType === 'in' && selectedProductId && (
                <p className="text-xs leading-5 text-muted-foreground">
                  O custo da compra será lançado automaticamente como despesa financeira.
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Confirmar ajuste
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
