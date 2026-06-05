'use client';

import { useEffect } from 'react';
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
  productToEdit?: Product | null;
}

type ProductFormValues = Omit<Product, 'id'>;

export function ProductModal({ open, onOpenChange, productToEdit }: ProductModalProps) {
  const { addProduct, updateProduct } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Reset form when modal opens/closes or changes edit target
  useEffect(() => {
    if (open) {
      if (productToEdit) {
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
        reset({
          name: '',
          sku: '',
          category: '',
          purchasePrice: 0,
          salePrice: 0,
          stock: 0,
          supplier: '',
        });
      }
    }
  }, [open, productToEdit, reset]);

  const onSubmit = (data: ProductFormValues) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, data);
    } else {
      addProduct(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
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

            <div className="space-y-1">
              <Label htmlFor="stock">Estoque Inicial</Label>
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
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
