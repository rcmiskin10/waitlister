import type { RedditPost, RedditComment } from '@/types/triage';

interface RedditApiComment {
  kind: string;
  data: {
    id: string;
    body?: string;
    author: string;
    ups: number;
    parent_id: string;
    depth: number;
    replies?: {
      kind: string;
      data: {
        children: RedditApiComment[];
      };
    } | '';
  };
}

interface RedditApiPost {
  kind: string;
  data: {
    id: string;
    title: string;
    selftext: string;
    subreddit: string;
    author: string;
    ups: number;
    num_comments: number;
    url: string;
    permalink: string;
  };
}

export class RedditClient {
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Fetch Reddit thread using the public .json endpoint
   */
  async fetchThread(redditUrl: string): Promise<{
    post: RedditPost;
    comments: RedditComment[];
  }> {
    // Normalize URL and add .json
    let jsonUrl = redditUrl.trim();

    // Remove trailing slash
    if (jsonUrl.endsWith('/')) {
      jsonUrl = jsonUrl.slice(0, -1);
    }

    // Add .json if not present
    if (!jsonUrl.endsWith('.json')) {
      jsonUrl = `${jsonUrl}.json`;
    }

    console.log('[Reddit] Fetching:', jsonUrl);

    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error('Reddit is rate limiting requests. Please try again in a moment.');
      }
      throw new Error(`Reddit returned ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      if (text.includes('Blocked') || text.includes('whoa there')) {
        throw new Error('Reddit blocked the request. Try again in a few seconds.');
      }
      throw new Error('Reddit did not return JSON. The post may be unavailable.');
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length < 2) {
      throw new Error('Invalid Reddit response format');
    }

    // First element is the post, second is comments
    const postData = data[0]?.data?.children?.[0]?.data as RedditApiPost['data'];
    const commentsData = data[1]?.data?.children as RedditApiComment[];

    if (!postData) {
      throw new Error('Could not parse Reddit post');
    }

    const post: RedditPost = {
      title: postData.title,
      body: postData.selftext || '',
      subreddit: postData.subreddit,
      author: postData.author,
      upvotes: postData.ups,
      commentCount: postData.num_comments,
      url: `https://reddit.com${postData.permalink}`,
    };

    // Recursively extract comments
    const comments: RedditComment[] = [];
    this.extractComments(commentsData, comments, 0);

    console.log('[Reddit] Fetched post with', comments.length, 'comments');

    return { post, comments };
  }

  private extractComments(
    items: RedditApiComment[] | undefined,
    result: RedditComment[],
    depth: number
  ): void {
    if (!items) return;

    for (const item of items) {
      // Skip "more" items (load more comments)
      if (item.kind !== 't1') continue;

      const data = item.data;

      // Skip deleted/removed comments
      if (!data.body || data.body === '[deleted]' || data.body === '[removed]') {
        continue;
      }

      result.push({
        id: data.id,
        text: data.body,
        author: data.author,
        upvotes: data.ups,
        parentId: data.parent_id,
        depth: depth,
      });

      // Recursively get replies
      if (data.replies && typeof data.replies === 'object') {
        this.extractComments(data.replies.data?.children, result, depth + 1);
      }
    }
  }
}

// Singleton
let redditClient: RedditClient | null = null;

export function getRedditClient(): RedditClient {
  if (!redditClient) {
    redditClient = new RedditClient();
  }
  return redditClient;
}
