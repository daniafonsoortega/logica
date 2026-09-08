-- Migration 002: Add premium columns to profiles + extend coupons table
-- Run once in Supabase Dashboard → SQL Editor

-- profiles: premium access columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium         boolean    DEFAULT false,
  ADD COLUMN IF NOT EXISTS plano              text,
  ADD COLUMN IF NOT EXISTS premium_until      timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- coupons: extended affiliate + management columns
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS active             boolean    DEFAULT true,
  ADD COLUMN IF NOT EXISTS discount_percent   int        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uses_count         int        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applies_to_plano   text,
  ADD COLUMN IF NOT EXISTS affiliate_name     text,
  ADD COLUMN IF NOT EXISTS affiliate_email    text,
  ADD COLUMN IF NOT EXISTS commission_percent int        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes              text;

-- Sync existing data from old column names to new
UPDATE coupons SET
  discount_percent = COALESCE(discount_pct, 0),
  uses_count       = COALESCE(uses, 0);

-- coupon_uses table (if missing)
CREATE TABLE IF NOT EXISTS coupon_uses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code     text NOT NULL,
  user_id         uuid REFERENCES auth.users,
  user_email      text,
  plano           text,
  amount_paid_brl int  DEFAULT 0,
  discount_brl    int  DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;
