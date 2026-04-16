-- ══════════════════════════════════════════════════════════
-- Migration: add_accounts_and_limits
-- Adds: accounts table, account_id on transactions,
--       monthly_limit + limit_updated_at on categories,
--       transfer type on transactions
-- ══════════════════════════════════════════════════════════

-- 1. accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text          NOT NULL,
  balance     numeric(14,2) NOT NULL DEFAULT 0,
  icon        text,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- 2. Add account_id to transactions (nullable FK)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;

-- 3. Allow 'transfer' as a transaction type
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('income', 'expense', 'transfer'));

-- 4. Add monthly_limit and limit_updated_at to categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS monthly_limit numeric(14,2) CHECK (monthly_limit > 0);
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS limit_updated_at date;
