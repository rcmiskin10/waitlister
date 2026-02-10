import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'all'; // 'x', 'reddit', or 'all'
    const limit = parseInt(searchParams.get('limit') || '20');

    const results: Array<{
      id: string; // Analysis ID for linking to report
      postId: string; // Post ID for reference
      platform: 'x' | 'reddit';
      url: string;
      title: string;
      author: string;
      replyCount: number;
      analyzedAt: string;
      summary: {
        painCount: number;
        curiosityCount: number;
        fluffCount: number;
        objectionCount: number;
      };
    }> = [];

    // Fetch X/Twitter analyses
    if (platform === 'all' || platform === 'x') {
      const { data: xPosts } = await supabase
        .from('x_posts')
        .select(`
          id,
          tweet_url,
          text,
          author_handle,
          reply_count,
          created_at,
          triage_analyses (
            id,
            summary,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit) as { data: any[] | null };

      if (xPosts) {
        for (const post of xPosts) {
          const analysis = post.triage_analyses?.[0];
          if (analysis) {
            results.push({
              id: analysis.id, // Use analysis ID for report linking
              postId: post.id,
              platform: 'x',
              url: post.tweet_url,
              title: post.text?.substring(0, 100) + (post.text?.length > 100 ? '...' : ''),
              author: post.author_handle,
              replyCount: post.reply_count || 0,
              analyzedAt: analysis.created_at,
              summary: {
                painCount: analysis.summary?.painCount || 0,
                curiosityCount: analysis.summary?.curiosityCount || 0,
                fluffCount: analysis.summary?.fluffCount || 0,
                objectionCount: analysis.summary?.objectionCount || 0,
              },
            });
          }
        }
      }
    }

    // Fetch Reddit analyses
    if (platform === 'all' || platform === 'reddit') {
      const { data: redditPosts } = await supabase
        .from('reddit_posts')
        .select(`
          id,
          post_url,
          title,
          subreddit,
          author,
          comment_count,
          created_at,
          reddit_analyses (
            id,
            summary,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit) as { data: any[] | null };

      if (redditPosts) {
        for (const post of redditPosts) {
          const analysis = post.reddit_analyses?.[0];
          if (analysis) {
            results.push({
              id: analysis.id, // Use analysis ID for report linking
              postId: post.id,
              platform: 'reddit',
              url: post.post_url,
              title: post.title?.substring(0, 100) + (post.title?.length > 100 ? '...' : ''),
              author: `r/${post.subreddit} • u/${post.author}`,
              replyCount: post.comment_count || 0,
              analyzedAt: analysis.created_at,
              summary: {
                painCount: analysis.summary?.painCount || 0,
                curiosityCount: analysis.summary?.curiosityCount || 0,
                fluffCount: analysis.summary?.fluffCount || 0,
                objectionCount: analysis.summary?.objectionCount || 0,
              },
            });
          }
        }
      }
    }

    // Sort by analyzedAt descending
    results.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());

    return NextResponse.json({
      success: true,
      history: results.slice(0, limit),
    });
  } catch (error) {
    console.error('[Triage History] Error:', error);
    return NextResponse.json({
      success: true,
      history: [], // Return empty on error
    });
  }
}
