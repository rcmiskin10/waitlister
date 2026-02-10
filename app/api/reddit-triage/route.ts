import { NextRequest, NextResponse } from 'next/server';
import { GrokClient, isGrokConfigured } from '@/lib/grok/client';
import { RedditClient } from '@/lib/reddit/client';
import {
  getOrCreateRedditPost,
  getRedditPostWithComments,
  storeRedditComments,
  updateRedditCommentClassifications,
  storeRedditAnalysis,
  storedCommentsToRedditComments,
} from '@/lib/reddit/db';
import type { RedditAnalysis, RedditComment, RedditPost, AnalysisGoal } from '@/types/triage';

export const maxDuration = 120; // 2 minutes for web search

interface RedditTriageRequest {
  redditUrl: string;
  goal: AnalysisGoal;
  voiceStyle?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Check if Grok is configured
    if (!isGrokConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY.',
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RedditTriageRequest;
    const { redditUrl, goal, voiceStyle } = body;

    if (!redditUrl) {
      return NextResponse.json(
        { success: false, error: 'Reddit URL is required' },
        { status: 400 }
      );
    }

    // Validate Reddit URL
    const isRedditUrl = /reddit\.com\/r\/\w+\/comments\//.test(redditUrl);
    if (!isRedditUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Reddit URL. Expected format: https://reddit.com/r/subreddit/comments/...'
        },
        { status: 400 }
      );
    }

    const grok = new GrokClient();
    const reddit = new RedditClient();
    let dbPostId: string | undefined;

    // Step 1: Check database for cached data first
    console.log('[Reddit Triage] Checking database for cached data...');
    const cached = await getRedditPostWithComments(redditUrl);

    let post: RedditPost;
    let comments: RedditComment[];

    if (cached && cached.comments.length > 0) {
      console.log('[Reddit Triage] Found cached post with', cached.comments.length, 'comments');
      dbPostId = cached.post.id;
      post = {
        title: cached.post.title,
        body: cached.post.body,
        subreddit: cached.post.subreddit,
        author: cached.post.author,
        upvotes: cached.post.upvotes,
        commentCount: cached.post.commentCount,
        url: redditUrl,
      };
      comments = storedCommentsToRedditComments(cached.comments);
    } else {
      // Fetch from API
      console.log('[Reddit Triage] Fetching thread from:', redditUrl);

      try {
        // Try direct Reddit JSON API first (faster and more reliable)
        console.log('[Reddit Triage] Trying direct Reddit API...');
        const threadData = await reddit.fetchThread(redditUrl);
        post = threadData.post;
        comments = threadData.comments;
        console.log('[Reddit Triage] Direct API fetched', comments.length, 'comments');
      } catch (directError) {
        console.warn('[Reddit Triage] Direct API failed:', directError);

        // Fallback to Grok web search
        try {
          console.log('[Reddit Triage] Falling back to Grok web search...');
          const threadData = await grok.fetchRedditThread(redditUrl);
          post = threadData.post;
          comments = threadData.comments;
          console.log('[Reddit Triage] Grok fetched', comments.length, 'comments');
        } catch (grokError) {
          const message = directError instanceof Error ? directError.message : 'Failed to fetch Reddit thread';
          return NextResponse.json(
            { success: false, error: `Could not fetch Reddit thread: ${message}` },
            { status: 400 }
          );
        }
      }

      // Save post and comments to database
      const storedPost = await getOrCreateRedditPost(redditUrl, post);
      if (storedPost) {
        dbPostId = storedPost.id;
        console.log('[Reddit Triage] Stored post in database:', dbPostId);

        if (comments.length > 0) {
          await storeRedditComments(dbPostId, comments);
          console.log('[Reddit Triage] Stored', comments.length, 'comments in database');
        }
      }
    }

    if (comments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No comments found. The post may be new, locked, or have no comments.',
        },
        { status: 400 }
      );
    }

    // Filter out comments from the original poster (OP)
    const commentsToAnalyze = comments.filter(
      (c) => c.author.toLowerCase() !== post.author.toLowerCase() && c.author !== '[deleted]'
    );

    if (commentsToAnalyze.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No comments to analyze (only found comments from the original poster).',
        },
        { status: 400 }
      );
    }

    console.log(
      '[Reddit Triage] Filtered out',
      comments.length - commentsToAnalyze.length,
      'OP/deleted comments, analyzing',
      commentsToAnalyze.length,
      'comments'
    );

    // Step 2: Classify all comments (excluding OP)
    const { classifiedComments, summary } = await grok.classifyRedditComments(post, commentsToAnalyze);

    // Step 3: Extract pain points from high-intent comments
    const highIntentComments = classifiedComments.filter(
      (c) => c.classification === 'pain' || c.classification === 'curiosity'
    );

    let painPoints: RedditAnalysis['painPoints'] = [];
    let keywords: string[] = [];
    let impliedSolutions: string[] = [];
    let dmCandidates: RedditAnalysis['dmCandidates'] = [];

    if (highIntentComments.length > 0) {
      console.log('[Reddit Triage] Extracting pain points from', highIntentComments.length, 'comments...');

      // Convert to the format extractPainPoints expects (Reply type)
      const repliesFormat = highIntentComments.map((c) => ({
        id: c.id,
        text: c.text,
        authorHandle: c.author,
        likes: c.upvotes,
        classification: c.classification,
        intentScore: c.intentScore,
        keyQuote: c.keyQuote,
        suggestedAction: c.suggestedAction,
      }));

      const extraction = await grok.extractPainPoints(repliesFormat as any);
      painPoints = extraction.painPoints;
      keywords = extraction.keywords;
      impliedSolutions = extraction.impliedSolutions;
      dmCandidates = extraction.dmCandidates;
    }

    // Step 4: Generate content
    console.log('[Reddit Triage] Generating content...');
    const content = await grok.generateRedditContent(
      post,
      painPoints,
      summary.topObjection,
      goal,
      voiceStyle
    );

    // Build the full analysis
    const analysis: RedditAnalysis = {
      source: 'reddit',
      url: redditUrl,
      post,
      goal,
      classifiedComments,
      summary,
      painPoints,
      keywords,
      impliedSolutions,
      dmCandidates,
      replyDrafts: content.replyDrafts,
      followUpPost: content.followUpPost,
      contentIdeas: content.contentIdeas.map((idea) => ({
        idea: idea.idea,
        format: idea.format as 'post' | 'comment' | 'guide' | 'video',
        why: idea.why,
      })),
      createdAt: new Date().toISOString(),
      id: `reddit-${Date.now()}`,
    };

    // Save classifications and analysis to database
    if (dbPostId) {
      try {
        await updateRedditCommentClassifications(dbPostId, classifiedComments);
        console.log('[Reddit Triage] Updated comment classifications in database');

        const analysisId = await storeRedditAnalysis(dbPostId, analysis);
        if (analysisId) {
          analysis.id = analysisId;
          console.log('[Reddit Triage] Stored analysis in database:', analysisId);
        }
      } catch (err) {
        console.warn('[Reddit Triage] Failed to save to database:', err);
      }
    }

    console.log('[Reddit Triage] Analysis complete!');
    return NextResponse.json({
      success: true,
      analysis,
      cached: !!dbPostId && !!cached,
    });
  } catch (error) {
    console.error('[Reddit Triage] Error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
