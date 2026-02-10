-- ============================================
-- Add profile images and timestamps
-- ============================================

-- Add profile image to x_posts
ALTER TABLE public.x_posts
ADD COLUMN IF NOT EXISTS author_profile_image TEXT;

-- Add profile image and timestamp to x_replies
ALTER TABLE public.x_replies
ADD COLUMN IF NOT EXISTS author_profile_image TEXT,
ADD COLUMN IF NOT EXISTS author_followers INTEGER,
ADD COLUMN IF NOT EXISTS retweets INTEGER DEFAULT 0;

-- Add profile image to reddit_comments
ALTER TABLE public.reddit_comments
ADD COLUMN IF NOT EXISTS author_profile_image TEXT;

COMMENT ON COLUMN public.x_posts.author_profile_image IS 'Profile image URL from X API';
COMMENT ON COLUMN public.x_replies.author_profile_image IS 'Profile image URL from X API';
COMMENT ON COLUMN public.x_replies.author_followers IS 'Follower count of the reply author';
COMMENT ON COLUMN public.x_replies.retweets IS 'Retweet count of the reply';
