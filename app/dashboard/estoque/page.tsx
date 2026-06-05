'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { AlertTriangle, TrendingDown, ArrowUpRight, ArrowDownRight, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function EstoquePage() {
  const { products, updateProduct, addTransaction } = useApp();
  
  // Stock adjustment modal states
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const stockItems = [...products].sort((a, b) => a.stock - b.stock);

  const handleOpenAdjust = (type: 'in' | 'out') => {
    setAdjustType(type);
    setSelectedProductId('');
    setAdjustQty(1);
    setErrorMsg('');
    setIsAdjustOpen(true);
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProductId) {
      setErrorMsg('Selecione um produto.');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
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

    // Calculate new stock
    const newStock = adjustType === 'in' 
      ? product.stock + adjustQty 
      : product.stock - adjustQty;

    // Update Product Stock
    updateProduct(product.id, { stock: newStock });

    // Register financial transaction if it is an Entry (restocking/purchasing represents an expense)
    if (adjustType === 'in') {
      const cost = product.purchasePrice * adjustQty;
      addTransaction({
        type: 'expense',
        amount: cost,
        description: `Compra de estoque: ${adjustQty}x ${product.name}`,
        category: 'Logística'
      });
    } else {
      // Out adjustment can be a waste/write-off (zero income) or standard sale (normally managed by Sales module)
    }

    setIsAdjustOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estoque</h2>
          <p className="text-muted-foreground">Controle de inventário e movimentações</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-rose-600 border-rose-200 dark:text-rose-400 hover:bg-rose-50"
            onClick={() => handleOpenAdjust('out')}
          >
            <ArrowDownRight className="mr-2 h-4 w-4" /> Registrar Saída
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleOpenAdjust('in')}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" /> Registrar Entrada
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.reduce((acc, curr) => acc + curr.stock, 0)}</div>
            <p className="text-xs text-muted-foreground">Unidades em armazém</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Esgotados</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stockItems.filter(i => i.stock === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Exigem atenção imediata</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-500">Estoque Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              {stockItems.filter(i => i.stock > 0 && i.stock < 5).length}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">Abaixo do mínimo (5 unidades)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posição de Estoque</CardTitle>
          <CardDescription>Visão geral atual de todos os produtos</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
              {stockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="text-center font-mono font-medium">{item.stock}</TableCell>
                  <TableCell className="text-center">
                    {item.stock === 0 ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Esgotado</span>
                    ) : item.stock < 5 ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Crítico</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Normal</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {stockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhum produto cadastrado no estoque.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manual Stock Adjustment Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {adjustType === 'in' ? 'Registrar Entrada de Estoque' : 'Registrar Saída de Estoque'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustStock} className="space-y-4 py-2">
            {errorMsg && (
              <p className="text-xs font-bold text-destructive bg-destructive/10 p-2.5 rounded">{errorMsg}</p>
            )}

            <div className="space-y-1">
              <Label htmlFor="adjustProduct">Produto</Label>
              <select
                id="adjustProduct"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione um produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="adjustQty">Quantidade</Label>
              <Input
                id="adjustQty"
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
              />
              {adjustType === 'in' && selectedProductId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nota: O custo total da compra será lançado automaticamente como Despesa.
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Confirmar Ajuste
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
