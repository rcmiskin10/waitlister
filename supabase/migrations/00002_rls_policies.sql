-- ============================================
-- NextSaaS AI Platform - RLS Policies
-- ============================================
-- Row Level Security policies for all tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_insights ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (for trigger)
DROP POLICY IF EXISTS "Service can insert profiles" ON public.profiles;
CREATE POLICY "Service can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- LANDING PAGES POLICIES
-- ============================================

-- Users can view their own landing pages
DROP POLICY IF EXISTS "Users can view own landing pages" ON public.landing_pages;
CREATE POLICY "Users can view own landing pages"
  ON public.landing_pages FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view published landing pages
DROP POLICY IF EXISTS "Public can view published pages" ON public.landing_pages;
CREATE POLICY "Public can view published pages"
  ON public.landing_pages FOR SELECT
  USING (is_published = true);

-- Users can create landing pages
DROP POLICY IF EXISTS "Users can create landing pages" ON public.landing_pages;
CREATE POLICY "Users can create landing pages"
  ON public.landing_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own landing pages
DROP POLICY IF EXISTS "Users can update own landing pages" ON public.landing_pages;
CREATE POLICY "Users can update own landing pages"
  ON public.landing_pages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own landing pages
DROP POLICY IF EXISTS "Users can delete own landing pages" ON public.landing_pages;
CREATE POLICY "Users can delete own landing pages"
  ON public.landing_pages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- AGENT SESSIONS POLICIES
-- ============================================

-- Users can view their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.agent_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.agent_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create sessions
DROP POLICY IF EXISTS "Users can create sessions" ON public.agent_sessions;
CREATE POLICY "Users can create sessions"
  ON public.agent_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
DROP POLICY IF EXISTS "Users can update own sessions" ON public.agent_sessions;
CREATE POLICY "Users can update own sessions"
  ON public.agent_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.agent_sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.agent_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RESEARCH REPORTS POLICIES
-- ============================================

-- Users can view their own research reports
DROP POLICY IF EXISTS "Users can view own research" ON public.research_reports;
CREATE POLICY "Users can view own research"
  ON public.research_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create research reports
DROP POLICY IF EXISTS "Users can create research" ON public.research_reports;
CREATE POLICY "Users can create research"
  ON public.research_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own research reports
DROP POLICY IF EXISTS "Users can update own research" ON public.research_reports;
CREATE POLICY "Users can update own research"
  ON public.research_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own research reports
DROP POLICY IF EXISTS "Users can delete own research" ON public.research_reports;
CREATE POLICY "Users can delete own research"
  ON public.research_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SOCIAL INSIGHTS POLICIES
-- ============================================

-- Users can view their own social insights
DROP POLICY IF EXISTS "Users can view own insights" ON public.social_insights;
CREATE POLICY "Users can view own insights"
  ON public.social_insights FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create social insights
DROP POLICY IF EXISTS "Users can create insights" ON public.social_insights;
CREATE POLICY "Users can create insights"
  ON public.social_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own social insights
DROP POLICY IF EXISTS "Users can update own insights" ON public.social_insights;
CREATE POLICY "Users can update own insights"
  ON public.social_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own social insights
DROP POLICY IF EXISTS "Users can delete own insights" ON public.social_insights;
CREATE POLICY "Users can delete own insights"
  ON public.social_insights FOR DELETE
  USING (auth.uid() = user_id);
