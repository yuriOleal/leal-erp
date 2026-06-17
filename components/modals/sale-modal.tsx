// ================================================================
// SALE MODAL — Modal de Registrar Nova Venda (PDV Digital)
//
// Este é o formulário mais complexo do sistema. Permite registrar
// uma venda completa com múltiplos produtos.
//
// FLUXO:
// 1. Seleciona um cliente (a partir dos clientes cadastrados)
// 2. Adiciona 1 ou mais produtos (com quantidade e preço)
// 3. O total é calculado automaticamente em tempo real
// 4. Valida estoque ANTES de enviar
// 5. Ao finalizar, chama a RPC create_sale_with_items no PostgreSQL
//    que atomicamente: cria a venda + deduz estoque + lança receita
//
// CARACTERÍSTICAS:
// - useFieldArray: permite adicionar/remover linhas de produtos dinamicamente
// - Cálculo de total em tempo real (useWatch + useEffect)
// - Validação de estoque em duas camadas (frontend + RPC no banco)
// - Preço do produto é preenchido automaticamente ao selecionar
// ================================================================

'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saleSchema } from '@/lib/validations/schemas';
import { useApp } from '@/lib/context/AppContext';
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
  status: 'completed' | 'pending'; // completed = baixa estoque + lança receita
  total: number;                    // Calculado automaticamente
};

export function SaleModal({ open, onOpenChange }: SaleModalProps) {
  // Dados do contexto: clientes (para selecionar), produtos (para o PDV),
  // e a função addSale que chama a RPC no banco
  const { clients, products: dbProducts, addSale } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── React Hook Form com useFieldArray (para campos dinâmicos) ──
  const {
    register,
    handleSubmit,
    control,      // Necessário para useFieldArray
    setValue,     // Define valores programaticamente
    reset,        // Reseta o formulário
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: '',
      clientName: '',
      products: [{ productId: '', name: '', quantity: 1, price: 0 }], // 1 linha vazia
      status: 'completed',
      total: 0,
    },
  });

  // useFieldArray gerencia a lista dinâmica de produtos
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  // Observa mudanças em tempo real
  const watchedProducts = useWatch({ control, name: 'products' });
  const watchedClientId = useWatch({ control, name: 'clientId' });
  const watchedTotal = useWatch({ control, name: 'total' });

  // ── Efeito: Auto-preenche nome do cliente ao selecionar ──
  useEffect(() => {
    if (watchedClientId) {
      const client = clients.find(c => c.id === watchedClientId);
      if (client) {
        setValue('clientName', client.name);
      }
    }
  }, [watchedClientId, clients, setValue]);

  // ── Efeito: Recalcula total da venda em tempo real ──
  // Dispara sempre que qualquer produto (quantidade ou preço) muda
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

  // ── Efeito: Reseta o formulário quando o modal abre ──
  useEffect(() => {
    if (open) {
      reset({
        clientId: '',
        clientName: '',
        products: [{ productId: '', name: '', quantity: 1, price: 0 }],
        status: 'completed',
        total: 0,
      });
    }
  }, [open, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    setErrorMsg(null);
    onOpenChange(nextOpen);
  };

  // ── Handler: Ao selecionar um produto no dropdown ──
  // Preenche automaticamente nome e preço de venda
  const handleProductSelect = (index: number, productId: string) => {
    const product = dbProducts.find(p => p.id === productId);
    if (product) {
      setValue(`products.${index}.name`, product.name);
      setValue(`products.${index}.price`, product.salePrice);

      // Alerta se o produto estiver zerado no estoque
      if (product.stock === 0) {
        setErrorMsg(`Produto "${product.name}" esgotado no estoque!`);
      } else {
        setErrorMsg(null);
      }
    }
  };

  // ── Handler: Submit da venda ──
  const onSubmit = (data: SaleFormValues) => {
    setErrorMsg(null);

    // Validação extra de estoque (mensagens amigáveis)
    // A RPC no banco também valida, mas aqui damos mensagens melhores
    for (const item of data.products) {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product) {
        setErrorMsg('Produto inválido selecionado.');
        return;
      }
      if (product.stock < item.quantity) {
        setErrorMsg(
          `Estoque insuficiente para "${product.name}". ` +
          `Estoque disponível: ${product.stock} unidades.`
        );
        return;
      }
    }

    // addSale é async e retorna { error: string | null }
    addSale(data).then((result) => {
      if (result.error) {
        setErrorMsg(result.error);  // Mostra erro retornado pela RPC
      } else {
        onOpenChange(false);        // Fecha modal em caso de sucesso
      }
    });
  };

  // ── RENDER ──
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
        </DialogHeader>

        {/* Alerta de erro (ex: estoque insuficiente) */}
        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-lg p-3.5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* ── Seleção de Cliente + Status ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dropdown de clientes cadastrados */}
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

            {/* Status: Concluída (dá baixa) ou Pendente (só registra) */}
            <div className="space-y-1">
              <Label htmlFor="status">Status da Venda</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="completed">Concluída (Baixa imediata no estoque)</option>
                <option value="pending">Pendente (Apenas registra)</option>
              </select>
            </div>
          </div>

          {/* ── Lista de Produtos (dinâmica) ── */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-bold">Itens da Venda</Label>
              {/* Botão para adicionar mais uma linha de produto */}
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
                const currentProduct = watchedProducts?.[index];
                const currentProductId = currentProduct?.productId ?? '';
                const quantity = currentProduct?.quantity || 0;
                const price = currentProduct?.price || 0;

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border/50">
                    {/* Dropdown de produto (mostra quantidade em estoque) */}
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
                          <option key={p.id} value={p.id}>
                            {p.name} (Qtd: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Campo Quantidade */}
                    <div className="w-full sm:w-24 space-y-1">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                        className="h-9 text-xs"
                      />
                    </div>

                    {/* Campo Preço (preenchido automaticamente, desabilitado) */}
                    <div className="w-full sm:w-28 space-y-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Preço (R$)"
                        {...register(`products.${index}.price` as const, { valueAsNumber: true })}
                        className="h-9 text-xs font-semibold"
                        disabled
                      />
                    </div>

                    {/* Subtotal da linha + botão remover */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:pl-2">
                      <span className="text-xs font-bold whitespace-nowrap min-w-[70px] text-right">
                        R$ {(quantity * price).toFixed(2)}
                      </span>

                      {/* Botão remover (só aparece se tiver mais de 1 linha) */}
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

          {/* ── Total Geral ── */}
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center text-lg font-bold bg-muted/20 p-4 rounded-lg">
            <span>Total Geral:</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              R$ {watchedTotal?.toFixed(2) || '0.00'}
            </span>
          </div>

          {/* ── Botões ── */}
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
