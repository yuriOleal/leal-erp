-- ============================================================
-- LEAL ERP - Seed Data (Dados de Demonstração)
-- Execute este script APÓS a migration.sql
-- no SQL Editor do Supabase com um usuário autenticado.
-- ============================================================

-- Substitua pelo UUID do seu usuário de teste:
-- SELECT id, email FROM auth.users;

-- ⚠️ Execute cada bloco individualmente, substituindo 'SEU_USER_ID'
-- pelo UUID real do usuário que você criou via /login (Sign Up)

-- ── PRODUTOS DE DEMO ─────────────────────────────────────
INSERT INTO public.products (user_id, name, sku, category, purchase_price, sale_price, stock, supplier) VALUES
('SEU_USER_ID', 'MacBook Pro 16" M3',       'MAC-16-M3',     'Eletrônicos', 15000.00, 22000.00, 12, 'Apple Brasil'),
('SEU_USER_ID', 'Monitor Dell U2723QE 27"', 'DELL-U2723QE',  'Eletrônicos',  3200.00,  4500.00,  4, 'Dell'),
('SEU_USER_ID', 'Cadeira Herman Miller Aeron','HM-AERON',     'Móveis',       8500.00, 12000.00,  1, 'Herman Miller'),
('SEU_USER_ID', 'Teclado Mecânico Keychron K8','KEY-K8-PRO',  'Acessórios',    450.00,   850.00, 25, 'Keychron'),
('SEU_USER_ID', 'Mouse Logitech MX Master 3S','LOGO-MX3S',    'Acessórios',    350.00,   650.00, 18, 'Logitech'),
('SEU_USER_ID', 'Mesa com Regulagem de Altura', 'MESA-ELEV-01','Móveis',      1800.00,  3200.00,  0, 'GenioDesk'),
('SEU_USER_ID', 'iPhone 15 Pro Max 256GB',   'IP15-PM-256',   'Eletrônicos',  6500.00,  9500.00,  8, 'Apple Brasil'),
('SEU_USER_ID', 'Samsung Galaxy S24 Ultra',   'SGS24-ULTRA',  'Eletrônicos',  5500.00,  8000.00, 10, 'Samsung Brasil'),
('SEU_USER_ID', 'Webcam Logitech Brio 4K',    'LOG-BRIO-4K',  'Acessórios',    800.00,  1200.00, 15, 'Logitech'),
('SEU_USER_ID', 'Notebook Dell Latitude 5540','DELL-LAT-5540','Eletrônicos',  4500.00,  6500.00,  6, 'Dell Brasil');

-- ── CLIENTES DE DEMO ─────────────────────────────────────
INSERT INTO public.clients (user_id, name, document, phone, email, address) VALUES
('SEU_USER_ID', 'Tech Solutions Inc.',    '12.345.678/0001-90', '(11) 98765-4321', 'contato@techsolutions.com',   'Av. Paulista, 1000 - São Paulo, SP'),
('SEU_USER_ID', 'Maria Silva & Cia',      '98.765.432/0001-10', '(21) 91234-5678', 'compras@mariasilva.com.br',   'Rua do Ouvidor, 50 - Rio de Janeiro, RJ'),
('SEU_USER_ID', 'Global Imports Ltda',    '45.678.901/0001-23', '(31) 99876-5432', 'import@global.com',           'Av. Afonso Pena, 500 - Belo Horizonte, MG'),
('SEU_USER_ID', 'Móveis Design SA',       '76.543.210/0001-56', '(41) 97654-3210', 'vendas@moveisdesign.com',     'Rua XV de Novembro, 200 - Curitiba, PR'),
('SEU_USER_ID', 'Construtora Horizonte',  '32.109.876/0001-89', '(51) 98123-4567', 'contato@horizonte.eng.br',   'Av. Ipiranga, 3000 - Porto Alegre, RS');

-- ── TRANSAÇÕES DE DEMO ───────────────────────────────────
INSERT INTO public.transactions (user_id, type, amount, description, category, created_at) VALUES
('SEU_USER_ID', 'income',  44000.00, 'Venda #1001 - Tech Solutions',      'Vendas',      '2025-06-10'),
('SEU_USER_ID', 'income',   7500.00, 'Venda #1002 - Maria Silva',         'Vendas',      '2025-06-12'),
('SEU_USER_ID', 'expense',  2500.00, 'Energia Elétrica - Junho',          'Contas Fixas','2025-06-13'),
('SEU_USER_ID', 'expense', 12000.00, 'Folha de Pagamento - Junho',        'RH',          '2025-06-14'),
('SEU_USER_ID', 'income',  45600.00, 'Venda #1003 - Construtora Horizonte','Vendas',     '2025-06-15'),
('SEU_USER_ID', 'expense',  3000.00, 'Google Ads - Campanha Junho',       'Marketing',   '2025-06-18'),
('SEU_USER_ID', 'income',  45000.00, 'Venda #1004 - Global Imports',     'Vendas',      '2025-06-20'),
('SEU_USER_ID', 'expense',  5000.00, 'Aluguel do Escritório',            'Contas Fixas','2025-06-22');
