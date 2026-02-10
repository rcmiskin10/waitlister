-- Stores Stripe product/price IDs created from config/pricing.ts
-- Auto-populated by the setup flow on first boot
CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL UNIQUE,           -- matches Plan.id from config (e.g. "pro")
  stripe_product_id TEXT NOT NULL,        -- Stripe product ID (prod_xxx)
  stripe_price_id TEXT NOT NULL,          -- Stripe price ID (price_xxx)
  stripe_yearly_price_id TEXT,            -- Optional yearly price ID
  price_amount INTEGER NOT NULL,          -- Price in cents (2900 = $29)
  price_interval TEXT NOT NULL DEFAULT 'month',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Only admins (service role) can manage this table
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON stripe_products
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read (for checkout flow)
CREATE POLICY "Authenticated users can read" ON stripe_products
  FOR SELECT TO authenticated USING (true);
