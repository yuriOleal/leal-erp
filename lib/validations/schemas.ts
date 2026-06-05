// ================================================================
// SCHEMAS DE VALIDAÇÃO (Zod)
// Define as regras de validação de cada formulário do sistema.
//
// O Zod permite validar dados em runtime (em tempo de execução) e
// inferir tipos TypeScript automaticamente.
//
// Esses schemas são usados pelo React Hook Form (com @hookform/resolvers)
// para validar os campos antes de enviar ao banco.
// ================================================================

import { z } from 'zod';

// ─── HELPERS (Funções auxiliares de validação) ─────────────────

// Regex para validar formato de CPF ou CNPJ (com ou sem pontuação)
const documentRegex = /^\d{2,3}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$|^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

// Regex para validar formato de telefone com DDD
const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

// ─── SCHEMAS DE VALIDAÇÃO ────────────────────────────────────────

/**
 * Schema do formulário de Login / Registro / Recuperação de Senha.
 * Usado na tela /login.
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Insira um endereço de email válido'),

  password: z.string()
    .min(6, 'A senha deve conter pelo menos 6 caracteres'),

  remember: z.boolean().optional(),
});

/**
 * Schema do formulário de Cadastro/Edição de Cliente.
 * Usado no ClientModal (modal de criar/editar cliente).
 */
export const clientSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres'),

  document: z.string()
    .refine(
      (doc) => documentRegex.test(doc.replace(/[^\d]/g, '')) || doc.length >= 11,
      'Insira um CPF (11 dígitos) ou CNPJ (14 dígitos) válido'
    ),

  phone: z.string()
    .refine(
      (tel) => phoneRegex.test(tel.replace(/[^\d]/g, '')) || tel.length >= 10,
      'Insira um número de telefone/celular válido com DDD'
    ),

  email: z.string()
    .email('Insira um email válido'),

  address: z.string()
    .min(5, 'O endereço deve conter pelo menos 5 caracteres'),
});

/**
 * Schema do formulário de Cadastro/Edição de Produto.
 * Usado no ProductModal.
 *
 * Inclui uma validação extra (.refine) que garante que o preço de venda
 * seja MAIOR que o preço de custo (senão você venderia no prejuízo).
 */
export const productSchema = z.object({
  name: z.string()
    .min(2, 'O nome do produto deve ter pelo menos 2 caracteres'),

  sku: z.string()
    .min(3, 'O SKU deve ter pelo menos 3 caracteres'),

  category: z.string()
    .min(2, 'A categoria é obrigatória'),

  purchasePrice: z.number()
    .min(0.01, 'Preço de custo deve ser maior que zero'),

  salePrice: z.number()
    .min(0.01, 'Preço de venda deve ser maior que zero'),

  stock: z.number()
    .int()
    .min(0, 'O estoque não pode ser negativo'),

  supplier: z.string()
    .min(2, 'O fornecedor é obrigatório'),
})
.refine(
  // Validação cruzada: preço de venda > preço de custo
  data => data.salePrice > data.purchasePrice,
  {
    message: 'O preço de venda deve ser maior que o preço de custo',
    path: ['salePrice'], // Mostra o erro no campo salePrice
  }
);

/**
 * Schema do formulário de Lançamento Financeiro (receita ou despesa).
 * Usado no TransactionModal.
 */
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']), // Só aceita 'income' ou 'expense'

  amount: z.number()
    .min(0.01, 'O valor deve ser maior que zero'),

  description: z.string()
    .min(3, 'A descrição deve ter pelo menos 3 caracteres'),

  category: z.string()
    .min(2, 'Selecione uma categoria'),
});

/**
 * Schema do formulário de Nova Venda (PDV).
 * Usado no SaleModal — o formulário mais complexo do sistema.
 *
 * Uma venda contém:
 * - 1 cliente
 * - 1 ou mais produtos (cada um com quantidade e preço)
 * - status (completed = dá baixa no estoque, pending = só registra)
 * - total calculado automaticamente
 */
export const saleSchema = z.object({
  clientId: z.string()
    .min(1, 'Selecione um cliente'),

  clientName: z.string()
    .min(1, 'Nome do cliente é obrigatório'),

  products: z.array(
    z.object({
      productId: z.string()
        .min(1, 'Selecione um produto'),

      name: z.string()
        .min(1),

      quantity: z.number()
        .int()
        .min(1, 'A quantidade mínima é 1'),

      price: z.number()
        .min(0.01),
    })
  )
  .min(1, 'Adicione pelo menos um produto à venda'), // Pelo menos 1 item

  status: z.enum(['completed', 'pending']),

  total: z.number()
    .min(0.01),
});
