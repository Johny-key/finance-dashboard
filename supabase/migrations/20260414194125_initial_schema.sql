-- ══════════════════════════════════════════════════════════
-- Migration: initial_schema
-- Finance Tracker — categories, transactions, budgets
-- ══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────
-- 1. TABLES
-- ──────────────────────────────────────────────────────────

CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  color       text        NOT NULL DEFAULT '#FF7056',
  icon        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id  uuid           REFERENCES categories(id) ON DELETE SET NULL,
  type         text           NOT NULL CHECK (type IN ('income', 'expense')),
  amount       numeric(14,2)  NOT NULL CHECK (amount > 0),
  description  text,
  date         date           NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz    NOT NULL DEFAULT now()
);

-- month is stored as the first day of each month (e.g. '2026-04-01')
-- the CHECK ensures only first-of-month values are accepted
CREATE TABLE budgets (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   uuid           NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month         date           NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  limit_amount  numeric(14,2)  NOT NULL CHECK (limit_amount > 0),
  created_at    timestamptz    NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, month)
);

-- ──────────────────────────────────────────────────────────
-- 2. INDEXES
-- ──────────────────────────────────────────────────────────

-- Dashboard: filter by user + sort by date (most frequent query)
CREATE INDEX idx_transactions_user_date
  ON transactions(user_id, date DESC);

-- Budget & chart aggregations: group by category
CREATE INDEX idx_transactions_category
  ON transactions(category_id);

-- Every page loads categories by user
CREATE INDEX idx_categories_user
  ON categories(user_id);

-- ──────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets       ENABLE ROW LEVEL SECURITY;

-- categories
CREATE POLICY "select_own_categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- transactions
CREATE POLICY "select_own_transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- budgets
CREATE POLICY "select_own_budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);
