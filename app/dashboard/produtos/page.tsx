'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { Product } from '@/types';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Package, Boxes, AlertTriangle, Wallet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProductModal } from '@/components/modals/product-modal';
import { PageHeader } from '@/components/page-header';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency } from '@/lib/formatters';

export default function ProdutosPage() {
  const { products, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;

    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  const inventoryValue = products.reduce(
    (total, product) => total + product.stock * product.purchasePrice,
    0
  );
  const lowStockCount = products.filter(product => product.stock > 0 && product.stock < 5).length;
  const outOfStockCount = products.filter(product => product.stock === 0).length;

  const handleNewProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      deleteProduct(id);
    }
  };

  const stockBadgeClass = (stock: number) => {
    if (stock === 0) {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
    }

    if (stock < 5) {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    }

    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        description="Organize itens, SKUs, fornecedores, custos, preços e estoque em um catálogo pronto para vender."
        actions={
          <Button onClick={handleNewProduct}>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Produtos"
          value={products.length}
          description="Itens cadastrados no catálogo."
          icon={Boxes}
          tone="slate"
        />
        <MetricCard
          label="Valor em estoque"
          value={formatCurrency(inventoryValue)}
          description="Custo acumulado das unidades disponíveis."
          icon={Wallet}
          tone="green"
        />
        <MetricCard
          label="Atenção"
          value={lowStockCount + outOfStockCount}
          description="Itens em nível crítico ou esgotado."
          icon={AlertTriangle}
          tone={lowStockCount + outOfStockCount > 0 ? 'amber' : 'green'}
        />
      </div>

      <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, SKU, categoria ou fornecedor..."
                className="h-10 rounded-xl bg-background pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {filteredProducts.length} de {products.length} produto(s)
            </p>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço venda</TableHead>
                <TableHead className="text-center">Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.supplier}</div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(product.salePrice)}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${stockBadgeClass(product.stock)}`}>
                      {product.stock} un.
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-accent hover:text-accent-foreground">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={Package}
                      title={products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
                      description={
                        products.length === 0
                          ? 'Cadastre o primeiro item para ativar vendas, estoque e relatórios do catálogo.'
                          : 'Ajuste a busca para encontrar outro item do catálogo.'
                      }
                      action={
                        products.length === 0 ? (
                          <Button size="sm" onClick={handleNewProduct}>
                            Cadastrar produto
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

      <ProductModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        productToEdit={productToEdit}
      />
    </div>
  );
}
