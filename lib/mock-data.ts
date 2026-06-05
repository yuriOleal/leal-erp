import { Client, Product, Sale, Transaction } from '@/types';

export const mockClients: Client[] = [
  { id: '1', name: 'Tech Solutions Inc.', document: '12.345.678/0001-90', phone: '(11) 98765-4321', email: 'contato@techsolutions.com', address: 'Av. Paulista, 1000 - São Paulo, SP', createdAt: '2023-01-15' },
  { id: '2', name: 'Maria Silva & Cia', document: '98.765.432/0001-10', phone: '(21) 91234-5678', email: 'compras@mariasilva.com.br', address: 'Rua do Ouvidor, 50 - Rio de Janeiro, RJ', createdAt: '2023-03-22' },
  { id: '3', name: 'Global Imports Ltda', document: '45.678.901/0001-23', phone: '(31) 99876-5432', email: 'import@global.com', address: 'Av. Afonso Pena, 500 - Belo Horizonte, MG', createdAt: '2023-06-10' },
  { id: '4', name: 'Móveis Design SA', document: '76.543.210/0001-56', phone: '(41) 97654-3210', email: 'vendas@moveisdesign.com', address: 'Rua XV de Novembro, 200 - Curitiba, PR', createdAt: '2023-08-05' },
  { id: '5', name: 'Construtora Horizonte', document: '32.109.876/0001-89', phone: '(51) 98123-4567', email: 'contato@horizonte.eng.br', address: 'Av. Ipiranga, 3000 - Porto Alegre, RS', createdAt: '2023-11-12' },
];

export const mockProducts: Product[] = [
  { id: '1', name: 'MacBook Pro 16"', sku: 'MAC-16-M3', category: 'Eletrônicos', purchasePrice: 15000, salePrice: 22000, stock: 12, supplier: 'Apple Brasil' },
  { id: '2', name: 'Monitor Dell UltraSharp 27"', sku: 'DELL-U2723QE', category: 'Eletrônicos', purchasePrice: 3200, salePrice: 4500, stock: 4, supplier: 'Dell' },
  { id: '3', name: 'Cadeira Ergonomica Herman Miller', sku: 'HM-AERON', category: 'Móveis', purchasePrice: 8500, salePrice: 12000, stock: 1, supplier: 'Herman Miller' },
  { id: '4', name: 'Teclado Mecânico Keychron K8', sku: 'KEY-K8-PRO', category: 'Acessórios', purchasePrice: 450, salePrice: 850, stock: 25, supplier: 'Keychron' },
  { id: '5', name: 'Mouse Logitech MX Master 3S', sku: 'LOGO-MX3S', category: 'Acessórios', purchasePrice: 350, salePrice: 650, stock: 18, supplier: 'Logitech' },
  { id: '6', name: 'Mesa com Regulagem de Altura', sku: 'MESA-ELEV-01', category: 'Móveis', purchasePrice: 1800, salePrice: 3200, stock: 0, supplier: 'GenioDesk' },
];

export const mockSales: Sale[] = [
  { id: '1001', clientId: '1', clientName: 'Tech Solutions Inc.', products: [{ productId: '1', name: 'MacBook Pro 16"', quantity: 2, price: 22000 }], total: 44000, date: '2024-05-10', status: 'completed' },
  { id: '1002', clientId: '2', clientName: 'Maria Silva & Cia', products: [{ productId: '4', name: 'Teclado Mecânico Keychron K8', quantity: 5, price: 850 }, { productId: '5', name: 'Mouse Logitech MX Master 3S', quantity: 5, price: 650 }], total: 7500, date: '2024-05-12', status: 'completed' },
  { id: '1003', clientId: '5', clientName: 'Construtora Horizonte', products: [{ productId: '6', name: 'Mesa com Regulagem de Altura', quantity: 3, price: 3200 }, { productId: '3', name: 'Cadeira Ergonomica Herman Miller', quantity: 3, price: 12000 }], total: 45600, date: '2024-05-15', status: 'completed' },
  { id: '1004', clientId: '3', clientName: 'Global Imports Ltda', products: [{ productId: '2', name: 'Monitor Dell UltraSharp 27"', quantity: 10, price: 4500 }], total: 45000, date: '2024-05-20', status: 'completed' },
  { id: '1005', clientId: '1', clientName: 'Tech Solutions Inc.', products: [{ productId: '1', name: 'MacBook Pro 16"', quantity: 1, price: 22000 }, { productId: '2', name: 'Monitor Dell UltraSharp 27"', quantity: 2, price: 4500 }], total: 31000, date: '2024-05-25', status: 'pending' },
];

export const mockFinancialTransactions: Transaction[] = [
  { id: 'F1', type: 'income', amount: 44000, description: 'Venda 1001', date: '2024-05-10', category: 'Vendas' },
  { id: 'F2', type: 'income', amount: 7500, description: 'Venda 1002', date: '2024-05-12', category: 'Vendas' },
  { id: 'F3', type: 'expense', amount: 2500, description: 'Energia Elétrica', date: '2024-05-13', category: 'Contas Fixas' },
  { id: 'F4', type: 'expense', amount: 12000, description: 'Folha de Pagamento', date: '2024-05-14', category: 'Rh' },
  { id: 'F5', type: 'income', amount: 45600, description: 'Venda 1003', date: '2024-05-15', category: 'Vendas' },
  { id: 'F6', type: 'expense', amount: 3000, description: 'Marketing Digital', date: '2024-05-18', category: 'Marketing' },
  { id: 'F7', type: 'income', amount: 45000, description: 'Venda 1004', date: '2024-05-20', category: 'Vendas' },
  { id: 'F8', type: 'expense', amount: 5000, description: 'Aluguel do Escritório', date: '2024-05-22', category: 'Contas Fixas' },
];

export const mockDashboardStats = {
  totalClients: 5,
  totalProducts: 6,
  totalSales: 5,
  monthlyRevenue: 142100,
  estimatedProfit: 45000,
  lowStockItems: 2,
};

export const mockChartData = [
  { name: 'Jan', revenue: 65000, expenses: 40000 },
  { name: 'Fev', revenue: 72000, expenses: 42000 },
  { name: 'Mar', revenue: 90000, expenses: 45000 },
  { name: 'Abr', revenue: 110000, expenses: 48000 },
  { name: 'Mai', revenue: 142100, expenses: 50000 },
  { name: 'Jun', revenue: 80000, expenses: 30000 },
];
