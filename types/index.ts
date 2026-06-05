export interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  supplier: string;
}

export interface SaleProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  products: SaleProduct[];
  total: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalSales: number;
  monthlyRevenue: number;
  estimatedProfit: number;
  lowStockItems: number;
}
