import { getRateLimiter, type RateLimitStatus } from './rate-limiter';

export interface SearchParams {
  query: string;
  maxResults?: number; // 10-100, default 100
  minReplies?: number; // min_replies:N operator
  minLikes?: number; // min_likes:N operator
  language?: string; // lang:XX operator
  sinceId?: string; // For pagination
  nextToken?: string; // For pagination
}

export interface SearchTweet {
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorProfileImage?: string;
  metrics: {
    replyCount: number;
    likeCount: number;
    retweetCount: number;
  };
  createdAt: string;
  conversationId: string;
}

export interface SearchResult {
  tweets: SearchTweet[];
  meta: {
    newestId?: string;
    oldestId?: string;
    resultCount: number;
    nextToken?: string;
  };
  rateLimitStatus: RateLimitStatus;
}

/**
 * Build a search query string with operators
 * NOTE: X API Basic plan only supports limited operators:
 * - lang:XX
 * - -is:retweet, -is:reply, is:reply
 * - Boolean: AND, OR, NOT, -
 * - Exact phrases with quotes
 * - from:, to:, @mentions
 *
 * NOT supported on Basic: min_replies:, min_faves:, filter:, wildcards *
 */
export function buildSearchQuery(params: SearchParams): string {
  // Clean the query - remove any unsupported operators the AI might have added
  let cleanQuery = params.query
    .replace(/min_replies:\d+/gi, '')
    .replace(/min_faves:\d+/gi, '')
    .replace(/min_retweets:\d+/gi, '')
    .replace(/filter:\w+/gi, '')
    .replace(/\*/g, '') // Remove wildcards
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const parts: string[] = [cleanQuery];

  // NOTE: min_replies and min_faves are NOT available on Basic plan
  // We'll filter by reply count client-side instead

  if (params.language) {
    parts.push(`lang:${params.language}`);
  }

  // Always exclude retweets and replies (we want original tweets only)
  parts.push('-is:retweet');
  parts.push('-is:reply');

  return parts.join(' ');
}

/**
 * Search for tweets using the X API v2 search/recent endpoint
 * Note: Basic plan only searches last 7 days
 */
export async function searchTweets(params: SearchParams): Promise<SearchResult> {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error('X_BEARER_TOKEN environment variable is not set');
  }

  const rateLimiter = getRateLimiter();

  // Check rate limit before making request
  if (!rateLimiter.canMakeRequest()) {
    const status = rateLimiter.getStatus();
    throw new Error(
      `Rate limit exceeded. Resets at ${status.resetsAt?.toISOString() || 'unknown'}`
    );
  }

  const query = buildSearchQuery(params);
  console.log('[X API Search] Built query:', query);
  const url = new URL('https://api.x.com/2/tweets/search/recent');

  url.searchParams.set('query', query);
  url.searchParams.set('max_results', String(params.maxResults || 100));
  url.searchParams.set(
    'tweet.fields',
    'author_id,conversation_id,public_metrics,created_at'
  );
  url.searchParams.set('user.fields', 'username,name,profile_image_url');
  url.searchParams.set('expansions', 'author_id');

  if (params.sinceId) {
    url.searchParams.set('since_id', params.sinceId);
  }

  if (params.nextToken) {
    url.searchParams.set('next_token', params.nextToken);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Track rate limit from response headers
  rateLimiter.trackRequest(response.headers);

  if (!response.ok) {
    const error = await response.text();
    console.error('[X API Search] Error response:', response.status, error);
    throw new Error(`X API search error: ${response.status} - ${error}`);
  }

  console.log('[X API Search] Response OK');

  const data = (await response.json()) as {
    data?: Array<{
      id: string;
      text: string;
      author_id: string;
      conversation_id: string;
      created_at: string;
      public_metrics?: {
        reply_count: number;
        like_count: number;
        retweet_count: number;
      };
    }>;
    includes?: {
      users?: Array<{
        id: string;
        username: string;
        name: string;
        profile_image_url?: string;
      }>;
    };
    meta?: {
      newest_id?: string;
      oldest_id?: string;
      result_count: number;
      next_token?: string;
    };
    errors?: Array<{ message: string; type: string }>;
  };

  if (data.errors && data.errors.length > 0) {
    console.error('[X API Search] API returned errors:', data.errors);
    throw new Error(`X API search error: ${data.errors[0].message}`);
  }

  console.log(`[X API Search] Found ${data.data?.length || 0} tweets, meta:`, data.meta);

  // Build user map for quick lookup
  const userMap = new Map(
    data.includes?.users?.map((u) => [u.id, u]) || []
  );

  const tweets: SearchTweet[] = (data.data || []).map((tweet) => {
    const user = userMap.get(tweet.author_id);
    return {
      id: tweet.id,
      text: tweet.text,
      authorId: tweet.author_id,
      authorUsername: user?.username || 'unknown',
      authorName: user?.name || 'Unknown',
      authorProfileImage: user?.profile_image_url,
      metrics: {
        replyCount: tweet.public_metrics?.reply_count || 0,
        likeCount: tweet.public_metrics?.like_count || 0,
        retweetCount: tweet.public_metrics?.retweet_count || 0,
      },
      createdAt: tweet.created_at,
      conversationId: tweet.conversation_id,
    };
  });

  return {
    tweets,
    meta: {
      newestId: data.meta?.newest_id,
      oldestId: data.meta?.oldest_id,
      resultCount: data.meta?.result_count || 0,
      nextToken: data.meta?.next_token,
    },
    rateLimitStatus: rateLimiter.getStatus(),
  };
}

/**
 * Search with pagination, fetching multiple pages up to a limit
 */
export async function searchTweetsWithPagination(
  params: SearchParams,
  maxTweets: number = 300
): Promise<SearchResult> {
  const allTweets: SearchTweet[] = [];
  let nextToken: string | undefined;
  let rateLimitStatus: RateLimitStatus = { remaining: 0, limit: 0 };

  do {
    const result = await searchTweets({
      ...params,
      nextToken,
    });

    allTweets.push(...result.tweets);
    nextToken = result.meta.nextToken;
    rateLimitStatus = result.rateLimitStatus;

    // Stop if we've reached the limit or no more pages
  } while (nextToken && allTweets.length < maxTweets);

  return {
    tweets: allTweets.slice(0, maxTweets),
    meta: {
      resultCount: allTweets.length,
    },
    rateLimitStatus,
  };
}
