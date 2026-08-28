import { describe, it, expect } from 'vitest';
import { loginSchema, clientSchema, productSchema, saleSchema } from '@/lib/validations/schemas';
import { isInCurrentMonth } from '@/lib/formatters';

describe('Suíte de Validação de Regras de Negócio (Zod Schemas)', () => {
  
  describe('Validação de Login', () => {
    it('deve validar um login válido com sucesso', () => {
      const result = loginSchema.safeParse({
        email: 'admin@lealerp.com.br',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('deve falhar se o email for inválido', () => {
      const result = loginSchema.safeParse({
        email: 'admin-invalido',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Insira um endereço de email válido');
      }
    });

    it('deve falhar se a senha for curta demais', () => {
      const result = loginSchema.safeParse({
        email: 'admin@lealerp.com.br',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A senha deve conter pelo menos 6 caracteres');
      }
    });
  });

  describe('Validação de Cadastro de Clientes', () => {
    it('deve validar um cliente com CNPJ correto', () => {
      const result = clientSchema.safeParse({
        name: 'Empresa Teste Ltda',
        document: '11.222.333/0001-81',
        phone: '11987654321',
        email: 'financeiro@empresateste.com',
        address: 'Rua das Flores, 123',
      });
      expect(result.success).toBe(true);
    });

    it('deve falhar se o documento CPF/CNPJ for curto demais', () => {
      const result = clientSchema.safeParse({
        name: 'Empresa Teste Ltda',
        document: '123',
        phone: '11987654321',
        email: 'financeiro@empresateste.com',
        address: 'Rua das Flores, 123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Insira um CPF ou CNPJ válido');
      }
    });

    it('deve falhar se o CPF/CNPJ tiver formato correto mas dígitos inválidos', () => {
      const result = clientSchema.safeParse({
        name: 'Empresa Teste Ltda',
        document: '11.111.111/1111-11',
        phone: '11987654321',
        email: 'financeiro@empresateste.com',
        address: 'Rua das Flores, 123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Validação de Cadastro de Produtos', () => {
    it('deve validar um produto correto', () => {
      const result = productSchema.safeParse({
        name: 'Notebook Dell Latitude',
        sku: 'DELL-LAT-15',
        category: 'Eletrônicos',
        purchasePrice: 3000,
        salePrice: 4500,
        stock: 10,
        supplier: 'Dell Brasil',
      });
      expect(result.success).toBe(true);
    });

    it('deve falhar se o preço de venda for menor que o preço de custo', () => {
      const result = productSchema.safeParse({
        name: 'Notebook Dell Latitude',
        sku: 'DELL-LAT-15',
        category: 'Eletrônicos',
        purchasePrice: 5000,
        salePrice: 4500, // Menor que 5000
        stock: 10,
        supplier: 'Dell Brasil',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O preço de venda deve ser maior que o preço de custo');
      }
    });

    it('deve falhar se a quantidade em estoque for negativa', () => {
      const result = productSchema.safeParse({
        name: 'Notebook Dell Latitude',
        sku: 'DELL-LAT-15',
        category: 'Eletrônicos',
        purchasePrice: 3000,
        salePrice: 4500,
        stock: -5, // Negativo
        supplier: 'Dell Brasil',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Validação de Vendas', () => {
    it('deve impedir o mesmo produto em mais de uma linha da venda', () => {
      const result = saleSchema.safeParse({
        clientId: 'cliente-1',
        clientName: 'Cliente de teste',
        status: 'completed',
        total: 200,
        products: [
          { productId: 'produto-1', name: 'Produto A', quantity: 1, price: 100 },
          { productId: 'produto-1', name: 'Produto A', quantity: 1, price: 100 },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Indicadores por período', () => {
    it('deve reconhecer uma data pertencente ao mês de referência', () => {
      expect(isInCurrentMonth('2026-07-16', new Date('2026-07-01T12:00:00'))).toBe(true);
      expect(isInCurrentMonth('2026-06-30', new Date('2026-07-01T12:00:00'))).toBe(false);
    });
  });
});
