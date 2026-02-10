import type { Reply, ClassifiedReply, TriageAnalysis } from '@/types/triage';
import type { ScoredThread } from '@/lib/thread-finder/types';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Lazy import to avoid errors when Supabase isn't configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSupabaseClient(): Promise<any> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { createAdminClient } = await import('@/lib/supabase/admin');
  return createAdminClient();
}

export interface StoredPost {
  id: string;
  tweetId: string;
  tweetUrl: string;
  authorHandle: string;
  authorName: string | null;
  authorProfileImage: string | null;
  text: string;
  likes: number;
  retweets: number;
  replyCount: number;
  fetchedAt: string;
}

export interface StoredReply {
  id: string;
  postId: string;
  replyId: string;
  authorHandle: string;
  authorName: string | null;
  authorProfileImage: string | null;
  authorFollowers: number | null;
  text: string;
  likes: number;
  retweets: number;
  createdAt: string | null;
  parentTweetId: string | null;
  classification: string | null;
  intentScore: number | null;
  keyQuote: string | null;
  suggestedAction: string | null;
  reason: string | null;
}

/**
 * Get or create a post in the database
 */
export async function getOrCreatePost(
  tweetUrl: string,
  tweetData: {
    text: string;
    authorHandle: string;
    authorName?: string;
    authorProfileImage?: string;
    likes: number;
    retweets: number;
    replyCount: number;
  },
  userId?: string
): Promise<StoredPost | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    console.log('[Triage DB] Supabase not configured, skipping database storage');
    return null;
  }

  // Extract tweet ID from URL
  const match = tweetUrl.match(/status\/(\d+)/);
  if (!match) {
    throw new Error('Invalid tweet URL');
  }
  const tweetId = match[1];

  // Try to find existing post
  const { data: existing } = await supabase
    .from('x_posts')
    .select('*')
    .eq('tweet_id', tweetId)
    .single();

  if (existing) {
    // Update with latest data
    const { data: updated } = await supabase
      .from('x_posts')
      .update({
        text: tweetData.text,
        author_handle: tweetData.authorHandle,
        author_name: tweetData.authorName,
        author_profile_image: tweetData.authorProfileImage,
        likes: tweetData.likes,
        retweets: tweetData.retweets,
        reply_count: tweetData.replyCount,
        fetched_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    return mapPost(updated || existing);
  }

  // Create new post
  const { data: created, error } = await supabase
    .from('x_posts')
    .insert({
      user_id: userId || null,
      tweet_id: tweetId,
      tweet_url: tweetUrl,
      author_handle: tweetData.authorHandle,
      author_name: tweetData.authorName,
      author_profile_image: tweetData.authorProfileImage,
      text: tweetData.text,
      likes: tweetData.likes,
      retweets: tweetData.retweets,
      reply_count: tweetData.replyCount,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPost(created);
}

/**
 * Get existing replies for a post
 */
export async function getRepliesForPost(postId: string): Promise<StoredReply[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('x_replies')
    .select('*')
    .eq('post_id', postId)
    .order('likes', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapReply);
}

/**
 * Store replies for a post (upsert to handle duplicates)
 */
export async function storeReplies(
  postId: string,
  replies: Reply[]
): Promise<StoredReply[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const replyRows = replies.map((reply, index) => ({
    post_id: postId,
    reply_id: reply.id || `reply-${index}`,
    author_handle: reply.authorHandle,
    author_name: reply.authorName || null,
    author_profile_image: reply.authorProfileImage || null,
    author_followers: reply.authorFollowers || null,
    text: reply.text,
    likes: reply.likes || 0,
    retweets: reply.retweets || 0,
    replied_at: reply.createdAt || null,
    parent_tweet_id: reply.parentTweetId || null,
  }));

  // Upsert replies
  const { data, error } = await supabase
    .from('x_replies')
    .upsert(replyRows, {
      onConflict: 'post_id,reply_id',
      ignoreDuplicates: false,
    })
    .select();

  if (error) throw error;
  return (data || []).map(mapReply);
}

/**
 * Update reply classifications after analysis
 */
export async function updateReplyClassifications(
  postId: string,
  classifiedReplies: ClassifiedReply[]
): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) return;

  for (const reply of classifiedReplies) {
    const replyId = reply.id || `reply-${classifiedReplies.indexOf(reply)}`;

    await supabase
      .from('x_replies')
      .update({
        classification: reply.classification,
        intent_score: reply.intentScore,
        key_quote: reply.keyQuote,
        suggested_action: reply.suggestedAction,
        reason: reply.reason,
      })
      .eq('post_id', postId)
      .eq('reply_id', replyId);
  }
}

/**
 * Store a triage analysis
 */
export async function storeAnalysis(
  postId: string,
  analysis: TriageAnalysis,
  userId?: string
): Promise<string | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('triage_analyses')
    .insert({
      user_id: userId || null,
      post_id: postId,
      goal: analysis.goal,
      summary: analysis.summary,
      pain_points: analysis.painPoints,
      keywords: analysis.keywords,
      implied_solutions: analysis.impliedSolutions,
      dm_candidates: analysis.dmCandidates,
      reply_drafts: analysis.replyDrafts,
      dm_templates: analysis.dmTemplates,
      objection_post: analysis.objectionPost,
      tomorrow_post: analysis.tomorrowPost,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Get post by tweet URL
 */
export async function getPostByUrl(tweetUrl: string): Promise<StoredPost | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const match = tweetUrl.match(/status\/(\d+)/);
  if (!match) return null;
  const tweetId = match[1];

  const { data } = await supabase
    .from('x_posts')
    .select('*')
    .eq('tweet_id', tweetId)
    .single();

  return data ? mapPost(data) : null;
}

/**
 * Get post with all its replies
 */
export async function getPostWithReplies(tweetUrl: string): Promise<{
  post: StoredPost;
  replies: StoredReply[];
} | null> {
  const post = await getPostByUrl(tweetUrl);
  if (!post) return null;

  const replies = await getRepliesForPost(post.id);
  return { post, replies };
}

// Helper functions to map database rows to our types
function mapPost(row: Record<string, unknown>): StoredPost {
  return {
    id: row.id as string,
    tweetId: row.tweet_id as string,
    tweetUrl: row.tweet_url as string,
    authorHandle: row.author_handle as string,
    authorName: row.author_name as string | null,
    authorProfileImage: row.author_profile_image as string | null,
    text: row.text as string,
    likes: row.likes as number,
    retweets: row.retweets as number,
    replyCount: row.reply_count as number,
    fetchedAt: row.fetched_at as string,
  };
}

function mapReply(row: Record<string, unknown>): StoredReply {
  return {
    id: row.id as string,
    postId: row.post_id as string,
    replyId: row.reply_id as string,
    authorHandle: row.author_handle as string,
    authorName: row.author_name as string | null,
    authorProfileImage: row.author_profile_image as string | null,
    authorFollowers: row.author_followers as number | null,
    text: row.text as string,
    likes: row.likes as number,
    retweets: (row.retweets as number) || 0,
    createdAt: row.replied_at as string | null,
    parentTweetId: row.parent_tweet_id as string | null,
    classification: row.classification as string | null,
    intentScore: row.intent_score as number | null,
    keyQuote: row.key_quote as string | null,
    suggestedAction: row.suggested_action as string | null,
    reason: row.reason as string | null,
  };
}

/**
 * Convert stored replies to the Reply type for analysis
 */
export function storedRepliesToReplies(storedReplies: StoredReply[]): Reply[] {
  return storedReplies.map((r) => ({
    id: r.replyId,
    text: r.text,
    authorHandle: r.authorHandle,
    authorName: r.authorName || undefined,
    authorProfileImage: r.authorProfileImage || undefined,
    authorFollowers: r.authorFollowers || undefined,
    likes: r.likes,
    retweets: r.retweets,
    createdAt: r.createdAt || undefined,
    parentTweetId: r.parentTweetId || undefined,
  }));
}

// ============================================
// Thread Discovery Functions
// ============================================

export interface StoredDiscovery {
  id: string;
  userId: string;
  topic: string;
  audience: string | null;
  language: string;
  painKeywords: string[];
  threadsFound: number;
  results: ScoredThread[];
  createdAt: string;
}

/**
 * Save a thread discovery search
 */
export async function saveDiscovery(
  userId: string,
  topic: string,
  audience: string | undefined,
  language: string,
  painKeywords: string[],
  threads: ScoredThread[]
): Promise<string | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    console.log('[DB] Supabase not configured, skipping discovery save');
    return null;
  }

  const { data, error } = await supabase
    .from('thread_discoveries')
    .insert({
      user_id: userId,
      topic,
      audience: audience || null,
      language,
      pain_keywords: painKeywords,
      threads_found: threads.length,
      results: threads,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[DB] Failed to save discovery:', error);
    return null;
  }

  console.log('[DB] Saved discovery:', data.id);
  return data.id;
}

/**
 * Get user's discovery history
 */
export async function getDiscoveryHistory(
  userId: string,
  limit: number = 20
): Promise<StoredDiscovery[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('thread_discoveries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DB] Failed to get discovery history:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    topic: row.topic,
    audience: row.audience,
    language: row.language,
    painKeywords: row.pain_keywords || [],
    threadsFound: row.threads_found,
    results: row.results || [],
    createdAt: row.created_at,
  }));
}

/**
 * Get a specific discovery by ID
 */
export async function getDiscoveryById(
  discoveryId: string
): Promise<StoredDiscovery | null> {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('thread_discoveries')
    .select('*')
    .eq('id', discoveryId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    topic: data.topic,
    audience: data.audience,
    language: data.language,
    painKeywords: data.pain_keywords || [],
    threadsFound: data.threads_found,
    results: data.results || [],
    createdAt: data.created_at,
  };
}

/**
 * Get user's analysis history (posts with their analyses)
 */
export async function getAnalysisHistory(
  userId: string,
  limit: number = 20
): Promise<Array<{
  post: StoredPost;
  analysis: {
    id: string;
    goal: string;
    summary: TriageAnalysis['summary'];
    createdAt: string;
  };
}>> {
  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('triage_analyses')
    .select(`
      id,
      goal,
      summary,
      created_at,
      x_posts (
        id,
        tweet_id,
        tweet_url,
        author_handle,
        author_name,
        author_profile_image,
        text,
        likes,
        retweets,
        reply_count,
        fetched_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DB] Failed to get analysis history:', error);
    return [];
  }

  return (data || [])
    .filter((row: any) => row.x_posts)
    .map((row: any) => ({
      post: mapPost(row.x_posts as Record<string, unknown>),
      analysis: {
        id: row.id,
        goal: row.goal,
        summary: row.summary as TriageAnalysis['summary'],
        createdAt: row.created_at,
      },
    }));
}
