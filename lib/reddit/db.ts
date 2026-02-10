import { createAdminClient } from '@/lib/supabase/admin';
import type {
  RedditPost,
  RedditComment,
  ClassifiedRedditComment,
  RedditAnalysis,
} from '@/types/triage';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Extract post ID from Reddit URL
 */
export function extractPostId(url: string): string | null {
  const match = url.match(/comments\/([a-z0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Get or create a Reddit post in the database
 */
export async function getOrCreateRedditPost(
  postUrl: string,
  postData: RedditPost
): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Reddit DB] Supabase not configured, skipping database storage');
    return null;
  }

  const supabase = createAdminClient();
  const postId = extractPostId(postUrl);

  if (!postId) {
    console.error('[Reddit DB] Could not extract post ID from URL:', postUrl);
    return null;
  }

  // Check if post already exists
  const { data: existing } = await supabase
    .from('reddit_posts')
    .select('id')
    .eq('post_id', postId)
    .single() as { data: { id: string } | null };

  if (existing) {
    // Update with latest data
    await (supabase as any)
      .from('reddit_posts')
      .update({
        upvotes: postData.upvotes,
        comment_count: postData.commentCount,
        fetched_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    return existing;
  }

  // Create new post
  const { data: newPost, error } = await supabase
    .from('reddit_posts')
    .insert({
      post_id: postId,
      post_url: postUrl,
      subreddit: postData.subreddit,
      author: postData.author,
      title: postData.title,
      body: postData.body,
      upvotes: postData.upvotes,
      comment_count: postData.commentCount,
    } as any)
    .select('id')
    .single() as { data: { id: string } | null; error: any };

  if (error) {
    console.error('[Reddit DB] Error creating post:', error);
    return null;
  }

  return newPost;
}

/**
 * Get a Reddit post with its comments from the database
 */
export async function getRedditPostWithComments(postUrl: string): Promise<{
  post: {
    id: string;
    title: string;
    body: string;
    subreddit: string;
    author: string;
    upvotes: number;
    commentCount: number;
  };
  comments: Array<{
    id: string;
    commentId: string;
    author: string;
    text: string;
    upvotes: number;
    depth: number;
    parentCommentId?: string;
    classification?: string;
    intentScore?: number;
  }>;
} | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createAdminClient();
  const postId = extractPostId(postUrl);

  if (!postId) {
    return null;
  }

  const { data: post } = await supabase
    .from('reddit_posts')
    .select('*')
    .eq('post_id', postId)
    .single() as { data: any };

  if (!post) {
    return null;
  }

  const { data: comments } = await supabase
    .from('reddit_comments')
    .select('*')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true }) as { data: any[] | null };

  return {
    post: {
      id: post.id,
      title: post.title,
      body: post.body || '',
      subreddit: post.subreddit,
      author: post.author,
      upvotes: post.upvotes,
      commentCount: post.comment_count,
    },
    comments: (comments || []).map((c: any) => ({
      id: c.id,
      commentId: c.comment_id,
      author: c.author,
      text: c.text,
      upvotes: c.upvotes,
      depth: c.depth,
      parentCommentId: c.parent_comment_id,
      classification: c.classification,
      intentScore: c.intent_score,
    })),
  };
}

/**
 * Store Reddit comments in the database
 */
export async function storeRedditComments(
  dbPostId: string,
  comments: RedditComment[]
): Promise<void> {
  if (!isSupabaseConfigured() || comments.length === 0) {
    return;
  }

  const supabase = createAdminClient();

  const commentsToInsert = comments.map((c) => ({
    post_id: dbPostId,
    comment_id: c.id,
    parent_comment_id: c.parentId || null,
    author: c.author,
    text: c.text,
    upvotes: c.upvotes,
    depth: c.depth,
  }));

  const { error } = await supabase
    .from('reddit_comments')
    .upsert(commentsToInsert as any, {
      onConflict: 'post_id,comment_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('[Reddit DB] Error storing comments:', error);
  }
}

/**
 * Update comment classifications in the database
 */
export async function updateRedditCommentClassifications(
  dbPostId: string,
  classifiedComments: ClassifiedRedditComment[]
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createAdminClient();

  for (const comment of classifiedComments) {
    await (supabase as any)
      .from('reddit_comments')
      .update({
        classification: comment.classification,
        intent_score: comment.intentScore,
        key_quote: comment.keyQuote,
        suggested_action: comment.suggestedAction,
        reason: comment.reason,
      })
      .eq('post_id', dbPostId)
      .eq('comment_id', comment.id);
  }
}

/**
 * Store Reddit analysis in the database
 */
export async function storeRedditAnalysis(
  dbPostId: string,
  analysis: RedditAnalysis
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('reddit_analyses')
    .insert({
      post_id: dbPostId,
      goal: analysis.goal,
      summary: analysis.summary,
      pain_points: analysis.painPoints,
      keywords: analysis.keywords,
      implied_solutions: analysis.impliedSolutions,
      dm_candidates: analysis.dmCandidates,
      reply_drafts: analysis.replyDrafts,
      follow_up_post: analysis.followUpPost,
      content_ideas: analysis.contentIdeas,
    } as any)
    .select('id')
    .single() as { data: { id: string } | null; error: any };

  if (error) {
    console.error('[Reddit DB] Error storing analysis:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Convert stored comments to RedditComment type
 */
export function storedCommentsToRedditComments(
  storedComments: Array<{
    id: string;
    commentId: string;
    author: string;
    text: string;
    upvotes: number;
    depth: number;
    parentCommentId?: string;
  }>
): RedditComment[] {
  return storedComments.map((c) => ({
    id: c.commentId,
    text: c.text,
    author: c.author,
    upvotes: c.upvotes,
    parentId: c.parentCommentId,
    depth: c.depth,
  }));
}
