-- ============================================
-- Reddit Posts and Comments Tables
-- For Reddit Triage feature
-- ============================================

-- ============================================
-- 1. REDDIT_POSTS TABLE
-- Store original Reddit posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.reddit_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id TEXT UNIQUE NOT NULL,
  post_url TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reddit_posts
CREATE INDEX IF NOT EXISTS idx_reddit_posts_user_id ON public.reddit_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_post_id ON public.reddit_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_subreddit ON public.reddit_posts(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_author ON public.reddit_posts(author);

-- ============================================
-- 2. REDDIT_COMMENTS TABLE
-- Store comments on Reddit posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.reddit_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.reddit_posts(id) ON DELETE CASCADE NOT NULL,
  comment_id TEXT NOT NULL,
  parent_comment_id TEXT,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  depth INTEGER DEFAULT 0,
  commented_at TIMESTAMPTZ,
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
  UNIQUE(post_id, comment_id)
);

-- Indexes for reddit_comments
CREATE INDEX IF NOT EXISTS idx_reddit_comments_post_id ON public.reddit_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reddit_comments_classification ON public.reddit_comments(classification);
CREATE INDEX IF NOT EXISTS idx_reddit_comments_intent ON public.reddit_comments(intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_comments_author ON public.reddit_comments(author);
CREATE INDEX IF NOT EXISTS idx_reddit_comments_parent ON public.reddit_comments(parent_comment_id);

-- ============================================
-- 3. REDDIT_ANALYSES TABLE
-- Store Reddit analysis results
-- ============================================
CREATE TABLE IF NOT EXISTS public.reddit_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.reddit_posts(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL CHECK (goal IN ('get_replies', 'get_clicks', 'pre_sell')),
  voice_style TEXT,
  summary JSONB DEFAULT '{}',
  pain_points JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  implied_solutions JSONB DEFAULT '[]',
  dm_candidates JSONB DEFAULT '[]',
  reply_drafts JSONB DEFAULT '[]',
  follow_up_post JSONB,
  content_ideas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reddit_analyses
CREATE INDEX IF NOT EXISTS idx_reddit_analyses_user_id ON public.reddit_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_reddit_analyses_post_id ON public.reddit_analyses(post_id);

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS reddit_posts_updated_at ON public.reddit_posts;
CREATE TRIGGER reddit_posts_updated_at
  BEFORE UPDATE ON public.reddit_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS reddit_comments_updated_at ON public.reddit_comments;
CREATE TRIGGER reddit_comments_updated_at
  BEFORE UPDATE ON public.reddit_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.reddit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_analyses ENABLE ROW LEVEL SECURITY;

-- reddit_posts policies
DROP POLICY IF EXISTS "Users can view their own reddit posts" ON public.reddit_posts;
CREATE POLICY "Users can view their own reddit posts"
  ON public.reddit_posts FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert reddit posts" ON public.reddit_posts;
CREATE POLICY "Users can insert reddit posts"
  ON public.reddit_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own reddit posts" ON public.reddit_posts;
CREATE POLICY "Users can update their own reddit posts"
  ON public.reddit_posts FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- reddit_comments policies (access through post ownership)
DROP POLICY IF EXISTS "Users can view comments on their posts" ON public.reddit_comments;
CREATE POLICY "Users can view comments on their posts"
  ON public.reddit_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reddit_posts
      WHERE reddit_posts.id = reddit_comments.post_id
      AND (reddit_posts.user_id = auth.uid() OR reddit_posts.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Users can insert reddit comments" ON public.reddit_comments;
CREATE POLICY "Users can insert reddit comments"
  ON public.reddit_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reddit_posts
      WHERE reddit_posts.id = reddit_comments.post_id
      AND (reddit_posts.user_id = auth.uid() OR reddit_posts.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Users can update comments on their posts" ON public.reddit_comments;
CREATE POLICY "Users can update comments on their posts"
  ON public.reddit_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.reddit_posts
      WHERE reddit_posts.id = reddit_comments.post_id
      AND (reddit_posts.user_id = auth.uid() OR reddit_posts.user_id IS NULL)
    )
  );

-- reddit_analyses policies
DROP POLICY IF EXISTS "Users can view their own reddit analyses" ON public.reddit_analyses;
CREATE POLICY "Users can view their own reddit analyses"
  ON public.reddit_analyses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert reddit analyses" ON public.reddit_analyses;
CREATE POLICY "Users can insert reddit analyses"
  ON public.reddit_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.reddit_posts IS 'Reddit posts for Reddit Triage analysis';
COMMENT ON TABLE public.reddit_comments IS 'Comments on Reddit posts with classification data';
COMMENT ON TABLE public.reddit_analyses IS 'Full Reddit triage analysis results';
