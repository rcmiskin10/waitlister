import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Try to find X/Twitter analysis first
    const { data: xAnalysis } = await supabase
      .from('triage_analyses')
      .select(`
        id,
        goal,
        summary,
        pain_points,
        keywords,
        implied_solutions,
        dm_candidates,
        reply_drafts,
        dm_templates,
        tomorrow_post,
        objection_post,
        created_at,
        x_posts (
          id,
          tweet_url,
          text,
          author_handle,
          reply_count,
          likes,
          retweets
        )
      `)
      .eq('id', id)
      .single() as { data: any };

    if (xAnalysis && xAnalysis.x_posts) {
      // Fetch classified replies
      const { data: replies } = await supabase
        .from('x_replies')
        .select('*')
        .eq('post_id', xAnalysis.x_posts.id)
        .order('likes', { ascending: false }) as { data: any[] | null };

      return NextResponse.json({
        success: true,
        platform: 'x',
        analysis: {
          id: xAnalysis.id,
          source: 'x',
          url: xAnalysis.x_posts.tweet_url,
          tweetText: xAnalysis.x_posts.text,
          tweetAuthor: xAnalysis.x_posts.author_handle,
          tweetMetadata: {
            likes: xAnalysis.x_posts.likes,
            retweets: xAnalysis.x_posts.retweets,
            replyCount: xAnalysis.x_posts.reply_count,
          },
          goal: xAnalysis.goal,
          summary: xAnalysis.summary,
          painPoints: xAnalysis.pain_points || [],
          keywords: xAnalysis.keywords || [],
          impliedSolutions: xAnalysis.implied_solutions || [],
          dmCandidates: xAnalysis.dm_candidates || [],
          replyDrafts: xAnalysis.reply_drafts || [],
          dmTemplates: xAnalysis.dm_templates || [],
          tomorrowPost: xAnalysis.tomorrow_post,
          objectionPost: xAnalysis.objection_post,
          classifiedReplies: (replies || []).map((r: any) => ({
            id: r.reply_id,
            text: r.text,
            authorHandle: r.author_handle,
            likes: r.likes,
            classification: r.classification,
            intentScore: r.intent_score,
            keyQuote: r.key_quote,
            suggestedAction: r.suggested_action,
            reason: r.reason,
          })),
          createdAt: xAnalysis.created_at,
        },
      });
    }

    // Try Reddit analysis
    const { data: redditAnalysis } = await supabase
      .from('reddit_analyses')
      .select(`
        id,
        goal,
        summary,
        pain_points,
        keywords,
        implied_solutions,
        dm_candidates,
        reply_drafts,
        follow_up_post,
        content_ideas,
        created_at,
        reddit_posts (
          id,
          post_url,
          title,
          body,
          subreddit,
          author,
          upvotes,
          comment_count
        )
      `)
      .eq('id', id)
      .single() as { data: any };

    if (redditAnalysis && redditAnalysis.reddit_posts) {
      // Fetch classified comments
      const { data: comments } = await supabase
        .from('reddit_comments')
        .select('*')
        .eq('post_id', redditAnalysis.reddit_posts.id)
        .order('upvotes', { ascending: false }) as { data: any[] | null };

      return NextResponse.json({
        success: true,
        platform: 'reddit',
        analysis: {
          id: redditAnalysis.id,
          source: 'reddit',
          url: redditAnalysis.reddit_posts.post_url,
          post: {
            title: redditAnalysis.reddit_posts.title,
            body: redditAnalysis.reddit_posts.body,
            subreddit: redditAnalysis.reddit_posts.subreddit,
            author: redditAnalysis.reddit_posts.author,
            upvotes: redditAnalysis.reddit_posts.upvotes,
            commentCount: redditAnalysis.reddit_posts.comment_count,
            url: redditAnalysis.reddit_posts.post_url,
          },
          goal: redditAnalysis.goal,
          summary: redditAnalysis.summary,
          painPoints: redditAnalysis.pain_points || [],
          keywords: redditAnalysis.keywords || [],
          impliedSolutions: redditAnalysis.implied_solutions || [],
          dmCandidates: redditAnalysis.dm_candidates || [],
          replyDrafts: redditAnalysis.reply_drafts || [],
          followUpPost: redditAnalysis.follow_up_post,
          contentIdeas: redditAnalysis.content_ideas || [],
          classifiedComments: (comments || []).map((c: any) => ({
            id: c.comment_id,
            text: c.text,
            author: c.author,
            upvotes: c.upvotes,
            depth: c.depth,
            parentId: c.parent_comment_id,
            classification: c.classification,
            intentScore: c.intent_score,
            keyQuote: c.key_quote,
            suggestedAction: c.suggested_action,
            reason: c.reason,
          })),
          createdAt: redditAnalysis.created_at,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Analysis not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[Triage Get] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
