-- ============================================
-- X Posts and Replies Tables
-- For Reply Triage Copilot feature
-- ============================================

-- ============================================
-- 1. X_POSTS TABLE
-- Store original X/Twitter posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.x_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tweet_id TEXT UNIQUE NOT NULL,
  tweet_url TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_name TEXT,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for x_posts
CREATE INDEX IF NOT EXISTS idx_x_posts_user_id ON public.x_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_x_posts_tweet_id ON public.x_posts(tweet_id);
CREATE INDEX IF NOT EXISTS idx_x_posts_author ON public.x_posts(author_handle);

-- ============================================
-- 2. X_REPLIES TABLE
-- Store replies to X posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.x_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.x_posts(id) ON DELETE CASCADE NOT NULL,
  reply_id TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_name TEXT,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  replied_at TIMESTAMPTZ,
  -- Classification data (filled in after analysis)
  classification TEXT CHECK (
    classification IN ('pain', 'curiosity', 'fluff', 'objection') OR classification IS NULL
  ),
  intent_score INTEGER CHECK (intent_score >= 1 AND intent_score <= 10 OR intent_score IS NULL),
  key_quote TEXT,
  suggested_action TEXT CHECK (
    suggested_action IN ('DM', 'Reply', 'Ignore', 'Address in post') OR suggested_action IS NULL
  ),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, reply_id)
);

-- Indexes for x_replies
CREATE INDEX IF NOT EXISTS idx_x_replies_post_id ON public.x_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_x_replies_classification ON public.x_replies(classification);
CREATE INDEX IF NOT EXISTS idx_x_replies_intent ON public.x_replies(intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_x_replies_author ON public.x_replies(author_handle);

-- ============================================
-- 3. TRIAGE_ANALYSES TABLE
-- Store analysis results
-- ============================================
CREATE TABLE IF NOT EXISTS public.triage_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.x_posts(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL CHECK (goal IN ('get_replies', 'get_clicks', 'pre_sell')),
  voice_style TEXT,
  summary JSONB DEFAULT '{}',
  pain_points JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  implied_solutions JSONB DEFAULT '[]',
  dm_candidates JSONB DEFAULT '[]',
  reply_drafts JSONB DEFAULT '[]',
  dm_templates JSONB DEFAULT '[]',
  objection_post JSONB,
  tomorrow_post JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for triage_analyses
CREATE INDEX IF NOT EXISTS idx_triage_analyses_user_id ON public.triage_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_triage_analyses_post_id ON public.triage_analyses(post_id);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS x_posts_updated_at ON public.x_posts;
CREATE TRIGGER x_posts_updated_at
  BEFORE UPDATE ON public.x_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS x_replies_updated_at ON public.x_replies;
CREATE TRIGGER x_replies_updated_at
  BEFORE UPDATE ON public.x_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.x_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.x_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_analyses ENABLE ROW LEVEL SECURITY;

-- x_posts policies
DROP POLICY IF EXISTS "Users can view their own posts" ON public.x_posts;
CREATE POLICY "Users can view their own posts"
  ON public.x_posts FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert posts" ON public.x_posts;
CREATE POLICY "Users can insert posts"
  ON public.x_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.x_posts;
CREATE POLICY "Users can update their own posts"
  ON public.x_posts FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- x_replies policies (access through post ownership)
DROP POLICY IF EXISTS "Users can view replies to their posts" ON public.x_replies;
CREATE POLICY "Users can view replies to their posts"
  ON public.x_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.x_posts
      WHERE x_posts.id = x_replies.post_id
      AND (x_posts.user_id = auth.uid() OR x_posts.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Users can insert replies" ON public.x_replies;
CREATE POLICY "Users can insert replies"
  ON public.x_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.x_posts
      WHERE x_posts.id = x_replies.post_id
      AND (x_posts.user_id = auth.uid() OR x_posts.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Users can update replies to their posts" ON public.x_replies;
CREATE POLICY "Users can update replies to their posts"
  ON public.x_replies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.x_posts
      WHERE x_posts.id = x_replies.post_id
      AND (x_posts.user_id = auth.uid() OR x_posts.user_id IS NULL)
    )
  );

-- triage_analyses policies
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.triage_analyses;
CREATE POLICY "Users can view their own analyses"
  ON public.triage_analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert analyses" ON public.triage_analyses;
CREATE POLICY "Users can insert analyses"
  ON public.triage_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.x_posts IS 'X/Twitter posts for Reply Triage analysis';
COMMENT ON TABLE public.x_replies IS 'Replies to X posts with classification data';
COMMENT ON TABLE public.triage_analyses IS 'Full triage analysis results';
