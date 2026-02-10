-- ============================================
-- Add parent tweet ID for nested replies
-- ============================================

-- Add parent_tweet_id to x_replies for tracking reply hierarchy
ALTER TABLE public.x_replies
ADD COLUMN IF NOT EXISTS parent_tweet_id TEXT;

-- Add index for efficient parent lookups
CREATE INDEX IF NOT EXISTS idx_x_replies_parent_tweet ON public.x_replies(parent_tweet_id);

COMMENT ON COLUMN public.x_replies.parent_tweet_id IS 'Tweet ID this reply is responding to (for nested replies)';
