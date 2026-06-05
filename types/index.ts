// ================================================================
// TIPOS DO SISTEMA (TypeScript Interfaces)
// Define a estrutura de dados de cada entidade do ERP
// ================================================================

/**
 * Cliente: Representa uma empresa ou pessoa física cadastrada no sistema.
 * Cada cliente pode ter múltiplas vendas associadas.
 */
export interface Client {
  id: string;          // Identificador único (UUID gerado pelo Supabase)
  name: string;        // Nome completo ou razão social
  document: string;    // CPF (11 dígitos) ou CNPJ (14 dígitos)
  phone: string;       // Telefone de contato com DDD
  email: string;       // Email corporativo ou pessoal
  address: string;     // Endereço completo (rua, número, cidade, estado)
  createdAt: string;   // Data de cadastro no sistema
}

/**
 * Produto: Item do catálogo que pode ser vendido e controlado em estoque.
 */
export interface Product {
  id: string;           // Identificador único (UUID)
  name: string;         // Nome de exibição do produto
  sku: string;          // Código SKU único para identificação no estoque
  category: string;     // Categoria (ex: Eletrônicos, Móveis, Acessórios)
  purchasePrice: number; // Preço de custo (quanto você pagou ao fornecedor)
  salePrice: number;     // Preço de venda (quanto você cobra do cliente)
  stock: number;         // Quantidade atual em estoque
  supplier: string;      // Nome do fornecedor
}

/**
 * Item de uma venda: Um produto específico dentro de um pedido de venda.
 * Uma venda pode conter múltiplos SaleProducts.
 */
export interface SaleProduct {
  productId: string;  // Referência ao ID do produto no catálogo
  name: string;       // Nome do produto (cópia no momento da venda)
  quantity: number;   // Quantidade vendida deste item
  price: number;      // Preço unitário no momento da venda
}

/**
 * Venda: Registro completo de uma transação de venda (pedido).
 */
export interface Sale {
  id: string;           // Número/ID único da venda
  clientId: string;     // Referência ao cliente que comprou
  clientName: string;   // Nome do cliente (cópia no momento da venda)
  products: SaleProduct[]; // Lista de itens vendidos
  total: number;        // Valor total da venda (soma dos itens)
  date: string;         // Data em que a venda foi realizada
  status: 'completed' | 'pending'; // Status: concluída (deu baixa no estoque) ou pendente
}

/**
 * Transação Financeira: Lançamento individual no fluxo de caixa.
 * Pode ser uma entrada (receita) ou saída (despesa).
 */
export interface Transaction {
  id: string;          // Identificador único
  type: 'income' | 'expense'; // Tipo: 'income' = receita/entrada, 'expense' = despesa/saída
  amount: number;      // Valor em reais (positivo)
  description: string; // Descrição do lançamento (ex: "Venda #1001", "Aluguel")
  date: string;        // Data do lançamento
  category: string;    // Categoria para agrupamento (ex: Vendas, Contas Fixas, RH, Marketing)
}

/**
 * DashboardStats: Métricas consolidadas exibidas na tela principal do Dashboard.
 * Calculadas dinamicamente a partir dos dados reais do banco.
 */
export interface DashboardStats {
  totalClients: number;     // Quantos clientes estão cadastrados
  totalProducts: number;    // Quantos produtos estão no catálogo
  totalSales: number;       // Quantas vendas foram registradas
  monthlyRevenue: number;   // Receita total do mês (soma de todas as entradas)
  estimatedProfit: number;  // Lucro estimado (receitas - despesas)
  lowStockItems: number;    // Itens com estoque abaixo de 5 unidades (alerta)
}
