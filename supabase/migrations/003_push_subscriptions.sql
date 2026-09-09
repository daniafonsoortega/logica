-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zsmuaxgrhnexrxtexlgp/sql

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON push_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users manage own" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
