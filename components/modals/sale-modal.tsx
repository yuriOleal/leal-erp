'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saleSchema } from '@/lib/validations/schemas';
import { useApp } from '@/lib/context/AppContext';
import { Sale } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

interface SaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SaleFormValues = {
  clientId: string;
  clientName: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'completed' | 'pending';
  total: number;
};

export function SaleModal({ open, onOpenChange }: SaleModalProps) {
  const { clients, products: dbProducts, addSale } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: '',
      clientName: '',
      products: [{ productId: '', name: '', quantity: 1, price: 0 }],
      status: 'completed',
      total: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const watchedProducts = watch('products');
  const watchedClientId = watch('clientId');

  // Update Client Name when Client ID changes
  useEffect(() => {
    if (watchedClientId) {
      const client = clients.find(c => c.id === watchedClientId);
      if (client) {
        setValue('clientName', client.name);
      }
    }
  }, [watchedClientId, clients, setValue]);

  // Recalculate Sale Total whenever products list changes
  useEffect(() => {
    let total = 0;
    if (watchedProducts) {
      watchedProducts.forEach((item) => {
        if (item.productId) {
          const quantity = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          total += quantity * price;
        }
      });
    }
    setValue('total', total);
  }, [watchedProducts, setValue]);

  // Reset form on open
  useEffect(() => {
    if (open) {
      reset({
        clientId: '',
        clientName: '',
        products: [{ productId: '', name: '', quantity: 1, price: 0 }],
        status: 'completed',
        total: 0,
      });
      setErrorMsg(null);
    }
  }, [open, reset]);

  // Handlers for product line updates
  const handleProductSelect = (index: number, productId: string) => {
    const product = dbProducts.find(p => p.id === productId);
    if (product) {
      setValue(`products.${index}.name`, product.name);
      setValue(`products.${index}.price`, product.salePrice);
      
      // Check stock alert
      if (product.stock === 0) {
        setErrorMsg(`Produto "${product.name}" esgotado no estoque!`);
      } else {
        setErrorMsg(null);
      }
    }
  };

  const onSubmit = (data: SaleFormValues) => {
    setErrorMsg(null);

    // Validate stocks manually to show nice messages
    for (const item of data.products) {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product) {
        setErrorMsg('Produto inválido selecionado.');
        return;
      }
      if (product.stock < item.quantity) {
        setErrorMsg(`Estoque insuficiente para "${product.name}". Estoque disponível: ${product.stock} unidades.`);
        return;
      }
    }

    addSale(data).then((result) => {
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-lg p-3.5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* Client Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clientId">Cliente</Label>
              <select
                id="clientId"
                {...register('clientId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-xs font-semibold text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="status">Status da Venda</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="completed">Concluída (Baixa imediata)</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-bold">Itens da Venda</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => append({ productId: '', name: '', quantity: 1, price: 0 })}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const currentProductId = watch(`products.${index}.productId`);
                const productDb = dbProducts.find(p => p.id === currentProductId);
                const stockLeft = productDb ? productDb.stock : 0;

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border/50">
                    <div className="flex-1 w-full space-y-1">
                      <select
                        value={currentProductId}
                        onChange={(e) => {
                          setValue(`products.${index}.productId`, e.target.value);
                          handleProductSelect(index, e.target.value);
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Selecione um produto...</option>
                        {dbProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Qtd: {p.stock})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24 w-full sm:w-24 space-y-1">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="w-28 w-full sm:w-28 space-y-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Preço (R$)"
                        {...register(`products.${index}.price` as const, { valueAsNumber: true })}
                        className="h-9 text-xs font-semibold"
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:pl-2">
                      <span className="text-xs font-bold whitespace-nowrap min-w-[70px] text-right">
                        R$ {((watch(`products.${index}.quantity`) || 0) * (watch(`products.${index}.price`) || 0)).toFixed(2)}
                      </span>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {errors.products && (
                <p className="text-xs font-semibold text-destructive">{errors.products.message}</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="h-px bg-border my-2" />
          
          <div className="flex justify-between items-center text-lg font-bold bg-muted/20 p-4 rounded-lg">
            <span>Total Geral:</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              R$ {watch('total')?.toFixed(2) || '0.00'}
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Finalizar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
