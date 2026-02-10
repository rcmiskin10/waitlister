-- ============================================
-- NextSaaS AI Platform - Initial Schema
-- ============================================
-- Run: supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- Extended user data + Stripe integration
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'free' CHECK (
    subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing')
  ),
  subscription_tier TEXT CHECK (
    subscription_tier IN ('pro', 'team') OR subscription_tier IS NULL
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
ON public.profiles(stripe_customer_id);

-- ============================================
-- 2. LANDING PAGES TABLE
-- Generated landing pages with JSONB content
-- ============================================
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  content JSONB NOT NULL DEFAULT '{"sections": []}',
  theme JSONB DEFAULT '{"primaryColor": "#6366f1", "secondaryColor": "#8b5cf6", "font": "Inter"}',
  metadata JSONB DEFAULT '{"title": "", "description": ""}',
  is_published BOOLEAN DEFAULT FALSE,
  posthog_dashboard_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for landing pages
CREATE INDEX IF NOT EXISTS idx_landing_pages_user_id
ON public.landing_pages(user_id);

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug
ON public.landing_pages(slug);

CREATE INDEX IF NOT EXISTS idx_landing_pages_published
ON public.landing_pages(is_published) WHERE is_published = true;

-- ============================================
-- 3. AGENT SESSIONS TABLE
-- Chat history and context per agent
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL CHECK (
    agent_type IN ('landing-generator', 'metrics-analyst', 'market-researcher', 'social-listener')
  ),
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id
ON public.agent_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_type
ON public.agent_sessions(agent_type);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_updated
ON public.agent_sessions(updated_at DESC);

-- ============================================
-- 4. RESEARCH REPORTS TABLE
-- Market research and validation results
-- ============================================
CREATE TABLE IF NOT EXISTS public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  idea_description TEXT NOT NULL,
  competitors JSONB DEFAULT '[]',
  market_size JSONB DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  opportunities JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for research reports
CREATE INDEX IF NOT EXISTS idx_research_reports_user_id
ON public.research_reports(user_id);

-- ============================================
-- 5. SOCIAL INSIGHTS TABLE
-- Social listening data from X, Reddit, HN
-- ============================================
CREATE TABLE IF NOT EXISTS public.social_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  platform TEXT CHECK (
    platform IN ('x', 'reddit', 'hackernews', 'all') OR platform IS NULL
  ),
  sentiment_summary JSONB DEFAULT '{}',
  pain_points JSONB DEFAULT '[]',
  feature_requests JSONB DEFAULT '[]',
  raw_mentions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for social insights
CREATE INDEX IF NOT EXISTS idx_social_insights_user_id
ON public.social_insights(user_id);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for auto-creating profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS agent_sessions_updated_at ON public.agent_sessions;
CREATE TRIGGER agent_sessions_updated_at
  BEFORE UPDATE ON public.agent_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.profiles IS 'Extended user profiles with Stripe subscription info';
COMMENT ON TABLE public.landing_pages IS 'AI-generated landing pages with JSONB content';
COMMENT ON TABLE public.agent_sessions IS 'Chat sessions with AI agents';
COMMENT ON TABLE public.research_reports IS 'Market research and validation reports';
COMMENT ON TABLE public.social_insights IS 'Social listening insights from X, Reddit, HN';
