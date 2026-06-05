-- ============================================================
-- LEAL ERP - Supabase Database Migration
-- Versão: 1.0.0
-- Descrição: Estrutura de tabelas com RLS (Row Level Security)
-- ============================================================

-- Habilitar extensão de UUID (já disponível no Supabase por padrão)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extensão da tabela auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  company     TEXT,
  email       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  document    TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  address     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  sku             TEXT NOT NULL,
  category        TEXT NOT NULL,
  purchase_price  DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sale_price      DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock           INTEGER NOT NULL DEFAULT 0,
  supplier        TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- ============================================================
-- 4. SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id    UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name  TEXT NOT NULL,
  total        DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status       TEXT NOT NULL CHECK (status IN ('completed', 'pending')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);

-- ============================================================
-- 5. SALE ITEMS (produtos dentro de uma venda)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sale_items (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id     UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  price       DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- ============================================================
-- 6. TRANSACTIONS (Fluxo de caixa)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      DECIMAL(12, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ============================================================
-- 7. RPC - Criar Venda com Baixa de Estoque (Transação Atômica)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_sale_with_items(
  p_user_id    UUID,
  p_client_id  UUID,
  p_client_name TEXT,
  p_total      DECIMAL,
  p_status     TEXT,
  p_items      JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id   UUID;
  v_item      JSONB;
  v_product   RECORD;
BEGIN
  -- Validate stock for all items first
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, stock, name INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
      AND user_id = p_user_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Produto não encontrado: ' || (v_item->>'name')
      );
    END IF;

    IF v_product.stock < (v_item->>'quantity')::INTEGER THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Estoque insuficiente para "' || v_product.name || '". Disponível: ' || v_product.stock
      );
    END IF;
  END LOOP;

  -- Create the sale record
  INSERT INTO public.sales (user_id, client_id, client_name, total, status)
  VALUES (p_user_id, p_client_id, p_client_name, p_total, p_status)
  RETURNING id INTO v_sale_id;

  -- Insert sale items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.sale_items (sale_id, product_id, name, quantity, price)
    VALUES (
      v_sale_id,
      (v_item->>'product_id')::UUID,
      v_item->>'name',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL
    );

    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'product_id')::UUID
      AND user_id = p_user_id;
  END LOOP;

  -- Auto-register financial income transaction if sale is completed
  IF p_status = 'completed' THEN
    INSERT INTO public.transactions (user_id, type, amount, description, category)
    VALUES (p_user_id, 'income', p_total, 'Venda #' || LEFT(v_sale_id::TEXT, 8), 'Vendas');
  END IF;

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id);
END;
$$;

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) - Isolamento por usuário
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- CLIENTS policies
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- PRODUCTS policies
CREATE POLICY "Users can view their own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- SALES policies
CREATE POLICY "Users can view their own sales"
  ON public.sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SALE_ITEMS policies (via sale ownership)
CREATE POLICY "Users can view their own sale items"
  ON public.sale_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sales
      WHERE sales.id = sale_items.sale_id
        AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sale items"
  ON public.sale_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales
      WHERE sales.id = sale_items.sale_id
        AND sales.user_id = auth.uid()
    )
  );

-- TRANSACTIONS policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);
