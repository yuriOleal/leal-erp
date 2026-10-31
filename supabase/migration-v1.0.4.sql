-- ============================================================
-- LEAL ERP - Atualização v1.0.4
-- Execute este arquivo no SQL Editor do Supabase para atualizar
-- instalações que já usavam a migration.sql anterior.
-- ============================================================

-- Histórico de cada ajuste de estoque. O saldo continua em products,
-- enquanto esta tabela preserva o motivo e a quantidade movimentada.
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('in', 'out', 'sale')),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  description TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON public.stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);

-- Impede novos saldos e valores inválidos mesmo se alguém tentar contornar a interface.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_amount_positive'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_total_nonnegative'
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_total_nonnegative CHECK (total >= 0) NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can insert their own stock movements" ON public.stock_movements;

CREATE POLICY "Users can view their own stock movements"
  ON public.stock_movements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock movements"
  ON public.stock_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- A implementação anterior recebia usuário, preço e total do navegador.
-- Revogamos o acesso para que nenhuma conta continue usando esse contrato.
REVOKE EXECUTE ON FUNCTION public.create_sale_with_items(UUID, UUID, TEXT, DECIMAL, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

-- Cria uma venda usando exclusivamente o usuário da sessão e os preços
-- cadastrados no banco. Pedido pendente não movimenta estoque nem caixa.
CREATE OR REPLACE FUNCTION public.create_sale_with_items(
  p_client_id UUID,
  p_status TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sale_id UUID;
  v_client_name TEXT;
  v_item JSONB;
  v_product RECORD;
  v_total DECIMAL(12, 2) := 0;
  v_quantity INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF p_status NOT IN ('completed', 'pending') THEN
    RAISE EXCEPTION 'Status de venda inválido.';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Inclua pelo menos um produto na venda.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      SELECT item->>'product_id' AS product_id, COUNT(*) AS total
      FROM jsonb_array_elements(p_items) AS item
      GROUP BY item->>'product_id'
    ) AS duplicated_items
    WHERE duplicated_items.product_id IS NULL OR duplicated_items.total > 1
  ) THEN
    RAISE EXCEPTION 'Cada produto deve aparecer apenas uma vez na venda.';
  END IF;

  SELECT name INTO v_client_name
  FROM public.clients
  WHERE id = p_client_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente não encontrado para esta conta.';
  END IF;

  -- Valida e bloqueia os produtos antes de gravar qualquer dado.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF COALESCE(v_item->>'product_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      OR COALESCE(v_item->>'quantity', '') !~ '^[1-9][0-9]*$' THEN
      RAISE EXCEPTION 'Item de venda inválido.';
    END IF;

    v_quantity := (v_item->>'quantity')::INTEGER;

    SELECT id, name, sale_price, stock INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
      AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto não encontrado para esta conta.';
    END IF;

    IF p_status = 'completed' AND v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %.', v_product.name, v_product.stock;
    END IF;

    v_total := v_total + (v_product.sale_price * v_quantity);
  END LOOP;

  INSERT INTO public.sales (user_id, client_id, client_name, total, status)
  VALUES (v_user_id, p_client_id, v_client_name, v_total, p_status)
  RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INTEGER;

    SELECT id, name, sale_price INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
      AND user_id = v_user_id;

    INSERT INTO public.sale_items (sale_id, product_id, name, quantity, price)
    VALUES (v_sale_id, v_product.id, v_product.name, v_quantity, v_product.sale_price);

    IF p_status = 'completed' THEN
      UPDATE public.products
      SET stock = stock - v_quantity
      WHERE id = v_product.id;

      INSERT INTO public.stock_movements (user_id, product_id, type, quantity, description)
      VALUES (v_user_id, v_product.id, 'sale', v_quantity, 'Baixa pela venda #' || LEFT(v_sale_id::TEXT, 8));
    END IF;
  END LOOP;

  IF p_status = 'completed' THEN
    INSERT INTO public.transactions (user_id, type, amount, description, category)
    VALUES (v_user_id, 'income', v_total, 'Venda #' || LEFT(v_sale_id::TEXT, 8), 'Vendas');
  END IF;

  RETURN jsonb_build_object('success', true, 'sale_id', v_sale_id, 'total', v_total);
END;
$$;

-- Conclui um pedido pendente no momento em que ele realmente sai da operação.
-- O estoque é validado de novo para evitar que uma reserva antiga gere saldo negativo.
CREATE OR REPLACE FUNCTION public.complete_pending_sale(p_sale_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sale RECORD;
  v_item RECORD;
  v_product RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  SELECT id, total, status INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado para esta conta.';
  END IF;

  IF v_sale.status <> 'pending' THEN
    RAISE EXCEPTION 'Apenas pedidos pendentes podem ser concluídos.';
  END IF;

  FOR v_item IN
    SELECT product_id, SUM(quantity)::INTEGER AS quantity
    FROM public.sale_items
    WHERE sale_id = p_sale_id
    GROUP BY product_id
  LOOP
    IF v_item.product_id IS NULL THEN
      RAISE EXCEPTION 'Um produto deste pedido foi removido do catálogo.';
    END IF;

    SELECT id, name, stock INTO v_product
    FROM public.products
    WHERE id = v_item.product_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND OR v_product.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para concluir o pedido. Revise o catálogo antes de continuar.';
    END IF;

    UPDATE public.products
    SET stock = stock - v_item.quantity
    WHERE id = v_product.id;

    INSERT INTO public.stock_movements (user_id, product_id, type, quantity, description)
    VALUES (v_user_id, v_product.id, 'sale', v_item.quantity, 'Baixa pela venda #' || LEFT(p_sale_id::TEXT, 8));
  END LOOP;

  UPDATE public.sales SET status = 'completed' WHERE id = p_sale_id;

  INSERT INTO public.transactions (user_id, type, amount, description, category)
  VALUES (v_user_id, 'income', v_sale.total, 'Venda #' || LEFT(p_sale_id::TEXT, 8), 'Vendas');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Ajusta o estoque e, nas entradas, registra o custo no financeiro na mesma transação.
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id UUID,
  p_type TEXT,
  p_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_product RECORD;
  v_new_stock INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF p_type NOT IN ('in', 'out') OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Movimentação de estoque inválida.';
  END IF;

  SELECT id, name, stock, purchase_price INTO v_product
  FROM public.products
  WHERE id = p_product_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado para esta conta.';
  END IF;

  IF p_type = 'out' AND v_product.stock < p_quantity THEN
    RAISE EXCEPTION 'Quantidade indisponível no estoque.';
  END IF;

  v_new_stock := CASE WHEN p_type = 'in' THEN v_product.stock + p_quantity ELSE v_product.stock - p_quantity END;

  UPDATE public.products SET stock = v_new_stock WHERE id = v_product.id;

  INSERT INTO public.stock_movements (user_id, product_id, type, quantity, description)
  VALUES (
    v_user_id,
    v_product.id,
    p_type,
    p_quantity,
    CASE WHEN p_type = 'in' THEN 'Entrada manual de estoque' ELSE 'Saída manual de estoque' END
  );

  IF p_type = 'in' THEN
    INSERT INTO public.transactions (user_id, type, amount, description, category)
    VALUES (
      v_user_id,
      'expense',
      v_product.purchase_price * p_quantity,
      'Compra de estoque: ' || p_quantity || 'x ' || v_product.name,
      'Logística'
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'stock', v_new_stock);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_sale_with_items(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_pending_sale(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_stock(UUID, TEXT, INTEGER) TO authenticated;
