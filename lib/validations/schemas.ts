import { z } from 'zod';

// Helper for CPF/CNPJ validation basic length check
const documentRegex = /^\d{2,3}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$|^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const loginSchema = z.object({
  email: z.string().email('Insira um endereço de email válido'),
  password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
  remember: z.boolean().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  document: z.string().refine(
    (doc) => documentRegex.test(doc.replace(/[^\d]/g, '')) || doc.length >= 11,
    'Insira um CPF (11 dígitos) ou CNPJ (14 dígitos) válido'
  ),
  phone: z.string().refine(
    (tel) => phoneRegex.test(tel.replace(/[^\d]/g, '')) || tel.length >= 10,
    'Insira um número de telefone/celular válido com DDD'
  ),
  email: z.string().email('Insira um email válido'),
  address: z.string().min(5, 'O endereço deve conter pelo menos 5 caracteres'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'O nome do produto deve ter pelo menos 2 caracteres'),
  sku: z.string().min(3, 'O SKU deve ter pelo menos 3 caracteres'),
  category: z.string().min(2, 'A categoria é obrigatória'),
  purchasePrice: z.number().min(0.01, 'Preço de custo deve ser maior que zero'),
  salePrice: z.number().min(0.01, 'Preço de venda deve ser maior que zero'),
  stock: z.number().int().min(0, 'O estoque não pode ser negativo'),
  supplier: z.string().min(2, 'O fornecedor é obrigatório'),
}).refine(data => data.salePrice > data.purchasePrice, {
  message: 'O preço de venda deve ser maior que o preço de custo',
  path: ['salePrice'],
});

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'O valor deve ser maior que zero'),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  category: z.string().min(2, 'Selecione uma categoria'),
});

export const saleSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  products: z.array(z.object({
    productId: z.string().min(1, 'Selecione um produto'),
    name: z.string().min(1),
    quantity: z.number().int().min(1, 'A quantidade mínima é 1'),
    price: z.number().min(0.01)
  })).min(1, 'Adicione pelo menos um produto à venda'),
  status: z.enum(['completed', 'pending']),
  total: z.number().min(0.01),
});
