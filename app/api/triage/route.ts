import { NextRequest, NextResponse } from 'next/server';
import { GrokClient, isGrokConfigured } from '@/lib/grok/client';
import { XApiClient, isXApiConfigured } from '@/lib/x-api/client';
import {
  getOrCreatePost,
  getPostWithReplies,
  storeReplies,
  updateReplyClassifications,
  storeAnalysis,
  storedRepliesToReplies,
} from '@/lib/triage/db';
import type { TriageRequest, TriageAnalysis, Reply, TweetMetadata } from '@/types/triage';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Check if Grok is configured
    if (!isGrokConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Grok API key is not configured. Please set OPENROUTER_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as TriageRequest & { forceRefresh?: boolean };
    let { tweetText, replies, goal, voiceStyle, tweetUrl } = body;
    const forceRefresh = body.forceRefresh || false;

    const grok = new GrokClient();
    let postId: string | undefined;
    let tweetAuthor = '';
    let tweetMetadata: TweetMetadata = {};

    // If URL provided, try to get from database first, then fetch if needed
    if (tweetUrl) {
      console.log('[Triage] Processing tweet URL:', tweetUrl, '| forceRefresh:', forceRefresh);

      // Check if we already have this post and its replies in the database
      const existing = await getPostWithReplies(tweetUrl);

      if (existing && existing.replies.length > 0 && !forceRefresh) {
        console.log('[Triage] Found cached post with', existing.replies.length, 'replies in database');
        postId = existing.post.id;
        tweetText = existing.post.text;
        tweetAuthor = existing.post.authorHandle;
        tweetMetadata = {
          likes: existing.post.likes,
          retweets: existing.post.retweets,
          replyCount: existing.post.replyCount,
          authorName: existing.post.authorName || undefined,
          authorProfileImage: existing.post.authorProfileImage || undefined,
        };
        replies = storedRepliesToReplies(existing.replies);
      } else {
        if (forceRefresh && existing) {
          console.log('[Triage] Force refresh requested, refetching from API...');
          postId = existing.post.id;
        }
        // Need to fetch from API
        console.log('[Triage] Fetching tweet from API...');
        let tweetData: {
          tweet: {
            text: string;
            authorHandle: string;
            authorName?: string;
            authorProfileImage?: string;
            likes: number;
            retweets: number;
            replyCount: number;
          };
          replies: Reply[];
        } | null = null;

        try {
          // Prefer Grok web search to conserve X API rate limits (15 req/15 min)
          console.log('[Triage] Using Grok web search (conserving X API rate limits)');
          try {
            const grokData = await grok.fetchTweetFromUrl(tweetUrl);
            tweetData = {
              tweet: {
                text: grokData.tweet.text,
                authorHandle: grokData.tweet.authorHandle,
                authorName: grokData.tweet.authorName,
                likes: grokData.tweet.likes,
                retweets: grokData.tweet.retweets,
                replyCount: grokData.tweet.replyCount,
              },
              replies: grokData.replies,
            };
            console.log('[Triage] Grok fetched', tweetData.replies.length, 'replies');
          } catch (grokError) {
            const grokMessage = grokError instanceof Error ? grokError.message : 'Unknown error';
            console.warn('[Triage] Grok fetch failed:', grokMessage);

            // Fall back to X API only if Grok fails
            if (isXApiConfigured()) {
              console.log('[Triage] Falling back to X API');
              const xApi = new XApiClient();
              tweetData = await xApi.fetchTweetAndReplies(tweetUrl);
              console.log('[Triage] X API fetched', tweetData.replies.length, 'replies');
            } else {
              throw new Error(
                `Could not fetch tweet. Grok web search failed and X API is not configured. ` +
                `Error: ${grokMessage}`
              );
            }
          }

          // Store the post and replies in the database
          if (tweetData) {
            tweetText = tweetData.tweet.text;
            tweetAuthor = tweetData.tweet.authorHandle;
            tweetMetadata = {
              likes: tweetData.tweet.likes,
              retweets: tweetData.tweet.retweets,
              replyCount: tweetData.tweet.replyCount,
              authorName: tweetData.tweet.authorName,
              authorProfileImage: tweetData.tweet.authorProfileImage,
            };
            replies = tweetData.replies;

            // Store post in database (if Supabase is configured)
            const storedPost = await getOrCreatePost(tweetUrl, tweetData.tweet);
            if (storedPost) {
              postId = storedPost.id;
              console.log('[Triage] Stored post in database:', postId);

              // Store replies in database
              if (replies.length > 0) {
                await storeReplies(postId, replies);
                console.log('[Triage] Stored', replies.length, 'replies in database');
              }
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch tweet';
          return NextResponse.json(
            { success: false, error: `Could not fetch tweet: ${message}` },
            { status: 400 }
          );
        }
      }
    }

    if (!tweetText || !replies || replies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing tweetText or replies. Provide either a URL or paste manually.',
        },
        { status: 400 }
      );
    }

    // Filter out DIRECT replies from the original poster (OP)
    // Keep OP's replies to other people (nested replies) - those are valuable context
    const repliesToAnalyze = tweetAuthor
      ? replies.filter((r) => {
          const isOP = r.authorHandle.toLowerCase() === tweetAuthor.toLowerCase();
          // Keep the reply if it's not from OP, OR if it's from OP but is a nested reply (has parentTweetId)
          return !isOP || (isOP && r.parentTweetId);
        })
      : replies;

    if (repliesToAnalyze.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No replies to analyze (only found direct replies from the original poster).',
        },
        { status: 400 }
      );
    }

    console.log(
      '[Triage] Filtered out',
      replies.length - repliesToAnalyze.length,
      'OP direct replies, analyzing',
      repliesToAnalyze.length,
      'replies (including OP nested replies)'
    );

    // Debug: log which replies have parentTweetId
    replies.forEach(r => {
      console.log(`[Triage] Reply from @${r.authorHandle}: parentTweetId=${r.parentTweetId || 'none'}`);
    });

    // ========== OPTIMIZED: Run analysis steps in parallel where possible ==========
    console.log('[Triage] Starting analysis (optimized parallel processing)...');
    const startTime = Date.now();

    // Step 1: Classify all replies (this must complete first)
    console.log('[Triage] Step 1: Classifying', repliesToAnalyze.length, 'replies...');
    const classifyStart = Date.now();
    const { classifiedReplies, summary } = await grok.classifyReplies(tweetText, repliesToAnalyze);
    console.log('[Triage] Classification done in', Date.now() - classifyStart, 'ms');

    // Update classifications in database (async, don't wait)
    if (postId) {
      updateReplyClassifications(postId, classifiedReplies).catch(err => {
        console.warn('[Triage] Failed to update classifications in DB:', err);
      });
    }

    // Get high-intent replies for extraction
    const highIntentReplies = classifiedReplies.filter(
      (r) => r.classification === 'pain' || r.classification === 'curiosity'
    );

    // Steps 2 & 3: Run pain extraction AND content generation IN PARALLEL
    console.log('[Triage] Steps 2+3: Running pain extraction and content generation in parallel...');
    const parallelStart = Date.now();

    // Build promises for parallel execution
    const extractionPromise = highIntentReplies.length > 0
      ? grok.extractPainPoints(highIntentReplies)
      : Promise.resolve({
          painPoints: [] as TriageAnalysis['painPoints'],
          keywords: [] as string[],
          impliedSolutions: [] as string[],
          dmCandidates: [] as TriageAnalysis['dmCandidates'],
        });

    // For content generation, we'll use preliminary data and the summary we already have
    const contentPromise = grok.generateContent(
      tweetText,
      [], // We'll update painPoints later if needed
      summary.topObjection,
      goal,
      voiceStyle
    );

    // Wait for both to complete in parallel
    const [extraction, content] = await Promise.all([extractionPromise, contentPromise]);
    console.log('[Triage] Parallel steps done in', Date.now() - parallelStart, 'ms');

    const { painPoints, keywords, impliedSolutions, dmCandidates } = extraction;
    console.log('[Triage] Total analysis time:', Date.now() - startTime, 'ms');

    // Build the full analysis
    const analysis: TriageAnalysis = {
      id: `triage-${Date.now()}`,
      tweetUrl: body.tweetUrl || '',
      tweetText,
      tweetAuthor,
      tweetMetadata,
      goal,
      classifiedReplies,
      summary,
      painPoints,
      keywords,
      impliedSolutions,
      dmCandidates,
      replyDrafts: content.replyDrafts,
      dmTemplates: content.dmTemplates,
      objectionPost: content.objectionPost,
      tomorrowPost: content.tomorrowPost,
      createdAt: new Date().toISOString(),
    };

    // Store analysis in database if we have a post ID
    if (postId) {
      try {
        const analysisId = await storeAnalysis(postId, analysis);
        if (analysisId) {
          analysis.id = analysisId;
          console.log('[Triage] Stored analysis in database:', analysisId);
        }
      } catch (err) {
        console.warn('[Triage] Failed to store analysis in DB:', err);
      }
    }

    console.log('[Triage] Analysis complete!');
    return NextResponse.json({
      success: true,
      analysis,
      cached: !!postId && !body.tweetUrl, // Indicate if we used cached data
    });
  } catch (error) {
    console.error('[Triage] Error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
