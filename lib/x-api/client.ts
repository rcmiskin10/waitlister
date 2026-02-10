import type { Reply } from '@/types/triage';

export class XApiClient {
  private bearerToken: string;
  private baseUrl = 'https://api.x.com/2';

  constructor() {
    const token = process.env.X_BEARER_TOKEN;
    if (!token) {
      throw new Error('X_BEARER_TOKEN environment variable is not set');
    }
    // Don't decode - the token may contain % characters that are part of the token itself
    this.bearerToken = token;
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`X API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getTweet(tweetId: string): Promise<{
    text: string;
    authorId: string;
    conversationId: string;
    publicMetrics: {
      replyCount: number;
      retweetCount: number;
      likeCount: number;
      bookmarkCount: number;
    };
  }> {
    const data = await this.request<{
      data?: {
        id: string;
        text: string;
        author_id: string;
        conversation_id: string;
        public_metrics: {
          reply_count: number;
          retweet_count: number;
          like_count: number;
          bookmark_count: number;
        };
      };
      errors?: Array<{ message: string; type: string }>;
    }>(`/tweets/${tweetId}`, {
      'tweet.fields': 'author_id,conversation_id,public_metrics,created_at',
    });

    if (!data.data) {
      const errorMsg = data.errors?.[0]?.message || 'Tweet not found or unavailable';
      throw new Error(`X API: ${errorMsg}`);
    }

    return {
      text: data.data.text,
      authorId: data.data.author_id,
      conversationId: data.data.conversation_id,
      publicMetrics: {
        replyCount: data.data.public_metrics?.reply_count || 0,
        retweetCount: data.data.public_metrics?.retweet_count || 0,
        likeCount: data.data.public_metrics?.like_count || 0,
        bookmarkCount: data.data.public_metrics?.bookmark_count || 0,
      },
    };
  }

  async getUser(userId: string): Promise<{
    id: string;
    username: string;
    name: string;
    profileImageUrl?: string;
  }> {
    const data = await this.request<{
      data?: {
        id: string;
        username: string;
        name: string;
        profile_image_url?: string;
      };
      errors?: Array<{ message: string }>;
    }>(`/users/${userId}`, {
      'user.fields': 'username,name,profile_image_url',
    });

    if (!data.data) {
      const errorMsg = data.errors?.[0]?.message || 'User not found';
      throw new Error(`X API: ${errorMsg}`);
    }

    return {
      id: data.data.id,
      username: data.data.username,
      name: data.data.name,
      profileImageUrl: data.data.profile_image_url,
    };
  }

  async getReplies(conversationId: string, maxResults: number = 100): Promise<Reply[]> {
    const replies: Reply[] = [];
    let nextToken: string | undefined;

    // Paginate to get all replies
    // Note: search/recent only searches last 7 days (Basic tier limitation)
    do {
      const params: Record<string, string> = {
        query: `conversation_id:${conversationId} -is:retweet`,
        'tweet.fields': 'author_id,public_metrics,created_at,in_reply_to_user_id,referenced_tweets,attachments',
        'user.fields': 'username,name,profile_image_url,public_metrics',
        'media.fields': 'url,preview_image_url,type,width,height',
        expansions: 'author_id,referenced_tweets.id,attachments.media_keys',
        max_results: Math.min(maxResults - replies.length, 100).toString(),
      };

      if (nextToken) {
        params.next_token = nextToken;
      }

      const data = await this.request<{
        data?: Array<{
          id: string;
          text: string;
          author_id: string;
          created_at?: string;
          public_metrics?: {
            like_count: number;
            retweet_count: number;
            reply_count: number;
            impression_count?: number;
          };
          referenced_tweets?: Array<{
            type: 'replied_to' | 'quoted' | 'retweeted';
            id: string;
          }>;
          attachments?: {
            media_keys?: string[];
          };
        }>;
        includes?: {
          users: Array<{
            id: string;
            username: string;
            name: string;
            profile_image_url?: string;
            public_metrics?: {
              followers_count: number;
              following_count: number;
            };
          }>;
          media?: Array<{
            media_key: string;
            type: 'photo' | 'video' | 'animated_gif';
            url?: string;
            preview_image_url?: string;
            width?: number;
            height?: number;
          }>;
        };
        meta?: {
          next_token?: string;
          result_count: number;
        };
      }>('/tweets/search/recent', params);

      if (data.data && data.includes?.users) {
        const userMap = new Map(data.includes.users.map((u) => [u.id, u]));
        const mediaMap = new Map(data.includes.media?.map((m) => [m.media_key, m]) || []);

        for (const tweet of data.data) {
          // Skip the original tweet itself
          if (tweet.id === conversationId) continue;

          const author = userMap.get(tweet.author_id);
          // Get the parent tweet ID (the tweet this is replying to)
          const parentTweet = tweet.referenced_tweets?.find(ref => ref.type === 'replied_to');

          // Get media attachments
          const media = tweet.attachments?.media_keys?.map(key => {
            const m = mediaMap.get(key);
            if (!m) return null;
            return {
              type: m.type,
              url: m.url,
              previewUrl: m.preview_image_url,
              width: m.width,
              height: m.height,
            };
          }).filter(Boolean) as Array<{ type: 'photo' | 'video' | 'animated_gif'; url?: string; previewUrl?: string; width?: number; height?: number }> | undefined;

          // Debug logging
          console.log(`[X API] Reply from @${author?.username}: parentTweetId=${parentTweet?.id}, isNested=${parentTweet?.id && parentTweet.id !== conversationId}`);

          replies.push({
            id: tweet.id,
            text: tweet.text,
            authorHandle: author?.username || 'unknown',
            authorName: author?.name,
            authorProfileImage: author?.profile_image_url,
            authorFollowers: author?.public_metrics?.followers_count,
            createdAt: tweet.created_at,
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            replyCount: tweet.public_metrics?.reply_count || 0,
            views: tweet.public_metrics?.impression_count,
            // If parent is the conversation root, don't set parentTweetId (it's a top-level reply)
            parentTweetId: parentTweet?.id !== conversationId ? parentTweet?.id : undefined,
            media: media && media.length > 0 ? media : undefined,
          });
        }
      }

      nextToken = data.meta?.next_token;
    } while (nextToken && replies.length < maxResults);

    // If no replies found, it might be because the tweet is older than 7 days
    // The Basic tier can only search recent tweets
    return replies;
  }

  async fetchTweetAndReplies(tweetUrl: string): Promise<{
    tweet: {
      text: string;
      authorHandle: string;
      authorName: string;
      authorProfileImage?: string;
      likes: number;
      retweets: number;
      replyCount: number;
    };
    replies: Reply[];
  }> {
    // Extract tweet ID from URL
    const match = tweetUrl.match(/status\/(\d+)/);
    if (!match) {
      throw new Error('Invalid tweet URL. Expected format: https://x.com/user/status/123...');
    }
    const tweetId = match[1];

    // Get the tweet
    const tweet = await this.getTweet(tweetId);

    // Get author info
    const author = await this.getUser(tweet.authorId);

    // Get all replies
    const replies = await this.getReplies(tweet.conversationId);

    return {
      tweet: {
        text: tweet.text,
        authorHandle: author.username,
        authorName: author.name,
        authorProfileImage: author.profileImageUrl,
        likes: tweet.publicMetrics.likeCount,
        retweets: tweet.publicMetrics.retweetCount,
        replyCount: tweet.publicMetrics.replyCount,
      },
      replies,
    };
  }
}

// Singleton instance
let xApiClient: XApiClient | null = null;

export function getXApiClient(): XApiClient {
  if (!xApiClient) {
    xApiClient = new XApiClient();
  }
  return xApiClient;
}

// Check if X API is configured
export function isXApiConfigured(): boolean {
  return !!process.env.X_BEARER_TOKEN;
}
