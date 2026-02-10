-- Entity Table: Waitlist Pages
-- Auto-generated from IdeaLaunch pipeline

CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Waitlist Page fields
  page_name TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  custom_domain TEXT,
  headline TEXT NOT NULL,
  description TEXT,
  launch_date DATE,
  referral_tracking_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  signup_count INTEGER NOT NULL DEFAULT '0',
  status TEXT NOT NULL DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON public.entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON public.entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_created_at ON public.entities(created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_entity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entities_updated_at
  BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION update_entity_updated_at();

-- RLS Policies
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entities"
  ON public.entities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entities"
  ON public.entities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entities"
  ON public.entities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entities"
  ON public.entities FOR DELETE
  USING (auth.uid() = user_id);
