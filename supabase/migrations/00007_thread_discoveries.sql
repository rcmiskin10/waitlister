-- ============================================
-- Thread Discoveries Table
-- For storing thread finder search history
-- ============================================

CREATE TABLE IF NOT EXISTS public.thread_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  audience TEXT, -- 'indie-hackers', 'build-in-public', etc.
  language TEXT DEFAULT 'en',
  pain_keywords JSONB DEFAULT '[]',
  threads_found INTEGER DEFAULT 0,
  results JSONB DEFAULT '[]', -- Array of scored threads
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_thread_discoveries_user_id ON public.thread_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_discoveries_created_at ON public.thread_discoveries(created_at DESC);

-- RLS
ALTER TABLE public.thread_discoveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own discoveries" ON public.thread_discoveries;
CREATE POLICY "Users can view their own discoveries"
  ON public.thread_discoveries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert discoveries" ON public.thread_discoveries;
CREATE POLICY "Users can insert discoveries"
  ON public.thread_discoveries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own discoveries" ON public.thread_discoveries;
CREATE POLICY "Users can delete their own discoveries"
  ON public.thread_discoveries FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.thread_discoveries IS 'Thread finder search history and results';

-- Also update x_replies to allow feature_request classification
ALTER TABLE public.x_replies DROP CONSTRAINT IF EXISTS x_replies_classification_check;
ALTER TABLE public.x_replies ADD CONSTRAINT x_replies_classification_check
  CHECK (classification IN ('pain', 'curiosity', 'fluff', 'objection', 'feature_request') OR classification IS NULL);
