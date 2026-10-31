// ================================================================
// PRODUCT MODAL — Modal de Criar/Editar Produto
//
// Permite cadastrar um novo produto no catálogo ou editar um existente.
//
// Campos do formulário:
// - Nome do produto
// - SKU (código interno único por usuário)
// - Categoria (ex: Eletrônicos, Móveis, Acessórios)
// - Fornecedor
// - Preço de Custo (quanto você pagou)
// - Preço de Venda (quanto você cobra — DEVE ser > preço de custo)
// - Estoque Inicial (quantidade em unidades)
//
// Validação: productSchema (Zod) — garante que preço de venda > preço de custo
// ================================================================

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validations/schemas';
import { useApp } from '@/lib/context/AppContext';
import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null; // null = modo criação, objeto = modo edição
}

// remove 'id' pois é gerado automaticamente pelo banco
type ProductFormValues = Omit<Product, 'id'>;

export function ProductModal({ open, onOpenChange, productToEdit }: ProductModalProps) {
  const { addProduct, updateProduct } = useApp();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      supplier: '',
    },
  });

  // Preenche ou limpa o formulário quando o modal abre
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        // Modo EDIÇÃO: carrega dados do produto existente
        reset({
          name: productToEdit.name,
          sku: productToEdit.sku,
          category: productToEdit.category,
          purchasePrice: productToEdit.purchasePrice,
          salePrice: productToEdit.salePrice,
          stock: productToEdit.stock,
          supplier: productToEdit.supplier,
        });
      } else {
        // Modo CRIAÇÃO: formulário em branco
        reset({
          name: '', sku: '', category: '',
          purchasePrice: 0, salePrice: 0, stock: 0, supplier: '',
        });
      }
    }
  }, [open, productToEdit, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitError(null);
    setIsSaving(true);

    try {
      let result: { error: string | null };

      if (productToEdit) {
        // Estoque não é alterado pela edição do catálogo. Toda movimentação
        // deve passar pelo módulo Estoque para preservar consistência.
        const { stock: _stock, ...catalogData } = data;
        result = await updateProduct(productToEdit.id, catalogData);
      } else {
        result = await addProduct(data);
      }

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setSubmitError(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {submitError && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {submitError}
            </p>
          )}
          {/* Linha 1: Nome e SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input id="name" placeholder="Ex: Monitor Dell 27" {...register('name')} />
              {errors.name && (
                <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">SKU (Código Interno)</Label>
              <Input id="sku" placeholder="Ex: DELL-27-U" {...register('sku')} />
              {errors.sku && (
                <p className="text-xs font-semibold text-destructive">{errors.sku.message}</p>
              )}
            </div>
          </div>

          {/* Linha 2: Categoria e Fornecedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" placeholder="Ex: Eletrônicos" {...register('category')} />
              {errors.category && (
                <p className="text-xs font-semibold text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input id="supplier" placeholder="Ex: Dell Brasil" {...register('supplier')} />
              {errors.supplier && (
                <p className="text-xs font-semibold text-destructive">{errors.supplier.message}</p>
              )}
            </div>
          </div>

          {/* Linha 3: Preço de Custo, Preço de Venda e Estoque */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="purchasePrice">Preço de Custo (R$)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('purchasePrice', { valueAsNumber: true })}
              />
              {errors.purchasePrice && (
                <p className="text-xs font-semibold text-destructive">{errors.purchasePrice.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('salePrice', { valueAsNumber: true })}
              />
              {errors.salePrice && (
                <p className="text-xs font-semibold text-destructive">{errors.salePrice.message}</p>
              )}
            </div>

            {productToEdit ? (
              <div className="space-y-1">
                <Label>Estoque atual</Label>
                <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm font-semibold">
                  {productToEdit.stock} unidade(s)
                </div>
                <p className="text-xs text-muted-foreground">Ajuste a quantidade pelo módulo Estoque.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="stock">Estoque inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  {...register('stock', { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-xs font-semibold text-destructive">{errors.stock.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Botões */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => { setSubmitError(null); onOpenChange(false); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : productToEdit ? 'Salvar alterações' : 'Cadastrar produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
