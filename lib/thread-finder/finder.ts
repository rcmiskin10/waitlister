import { getRateLimiter } from '@/lib/x-api/rate-limiter';
import { scoreAndRankThreads, calculatePainDensity } from './scorer';
// Note: X API client removed - using Grok web search for everything to conserve rate limits
import type {
  FinderInput,
  FinderResult,
  GeneratedQueries,
  ThreadCandidate,
  ClassifiedSample,
  FinderProgressCallback,
  AudienceConfig,
  AudiencePreset,
  ScoredThread,
} from './types';
import { AUDIENCE_PRESETS } from './types';

/**
 * FAST scoring - analyze tweet text only, no API calls
 * Deep reply analysis happens in triage when user clicks "Analyze Thread"
 *
 * CRITICAL: Requires BOTH topic relevance AND pain signals
 * Penalizes advice/opinion threads that discuss but don't experience pain
 */
function quickScoreFromText(
  candidates: ThreadCandidate[],
  topicKeywords: string[],
  painKeywords: string[]
): ScoredThread[] {
  // First-person pain indicators (someone EXPERIENCING the problem)
  const experiencedPainIndicators = [
    "i'm struggling", "i am struggling", "i can't", "i cant", "i hate",
    "i'm stuck", "i am stuck", "i'm frustrated", "help me", "anyone else",
    "how do i", "what am i doing wrong", "i don't know how", "i have no idea",
    "i spent", "i tried", "i built", "still no", "0 customers", "zero customers",
    "no users", "no signups", "failing", "burned out", "giving up"
  ];

  // Generic pain words (less valuable - could be advice or opinion)
  const genericPainIndicators = [
    'struggling', 'frustrated', 'hate', 'problem', 'issue', 'stuck',
    "can't", "won't", 'sucks', 'broken', 'help', 'advice',
    'tired of', 'sick of', 'impossible', 'nightmare', 'painful'
  ];

  // Advice/opinion/success story patterns to PENALIZE (not real pain)
  const advicePatterns = [
    'unpopular opinion', 'here\'s why', 'here\'s how', 'the key is',
    'the secret is', 'pro tip', 'hot take', 'reminder:', 'thread:',
    'here are', 'tips for', 'guide to', 'lesson learned',
    'what i learned', 'my advice', 'stop doing', 'start doing',
    // Specific "how to" ADVICE forms (NOT questions)
    'here is how to', 'here\'s how to', 'a thread on how to',
    // Success story patterns
    'my secret?', 'my secret:', 'the secret?', 'i did it by',
    'how i got', 'how i found', 'how i built', 'what worked for me',
    'this is how', 'this is what', 'finally figured out'
  ];

  // Question indicators — if present, the tweet is ASKING, not advising
  const questionIndicators = [
    '?', 'how do i', 'how can i', 'how should i',
    'anyone know', 'does anyone', 'can someone', 'can anybody',
    'any tips', 'any advice', 'need help', 'looking for',
    'where can i', 'what should i', 'what\'s the best way',
    'struggling to', 'help me',
  ];

  return candidates.map((candidate) => {
    const text = candidate.text.toLowerCase();
    const isQuestion = questionIndicators.some(q => text.includes(q));

    // CRITICAL: Check topic relevance FIRST
    const topicMatches = topicKeywords.filter(kw =>
      text.includes(kw.toLowerCase())
    );

    // Topic relevance score (0-1) - REQUIRED for high scores
    const topicRelevance = Math.min(topicMatches.length * 0.3, 1);

    // If topic relevance is too low, penalize heavily
    const isOnTopic = topicRelevance >= 0.3 || topicMatches.length >= 1;

    // Check for EXPERIENCED pain (first-person, real struggle)
    const experiencedPainMatches = experiencedPainIndicators.filter(p => text.includes(p));
    const hasExperiencedPain = experiencedPainMatches.length > 0;

    // Check for generic pain (less valuable)
    const genericPainMatches = genericPainIndicators.filter(p => text.includes(p));

    // Check for topic-specific pain keywords
    const painKeywordMatches = painKeywords.filter(kw =>
      text.includes(kw.toLowerCase())
    );

    // Check if this is an ADVICE/OPINION thread (penalize these)
    const adviceMatches = advicePatterns.filter(p => text.includes(p));
    const isAdviceThread = adviceMatches.length > 0;

    // Pain score calculation
    // Experienced pain is worth MORE than generic pain mentions
    let rawPainScore = 0.1;
    if (hasExperiencedPain) {
      rawPainScore += experiencedPainMatches.length * 0.25; // High value
    }
    rawPainScore += genericPainMatches.length * 0.08; // Lower value
    rawPainScore += painKeywordMatches.length * 0.1;
    rawPainScore = Math.min(rawPainScore, 1);

    // PENALIZE advice/opinion/success story threads heavily (but not questions)
    if (isAdviceThread && !isQuestion) {
      rawPainScore *= 0.2; // 80% penalty
      console.log(`[Finder] ⚠️ Advice/success thread: "${text.substring(0, 60)}..." (matched: ${adviceMatches.join(', ')})`);
    }

    // COMBINED SCORE: Topic relevance is a multiplier
    // If off-topic, pain signals don't count for much
    const painScore = isOnTopic
      ? rawPainScore * (0.5 + topicRelevance * 0.5)  // On-topic: pain matters
      : rawPainScore * 0.2;  // Off-topic: heavily penalized

    // Engagement signal (reply count matters for finding good threads)
    const engagementScore = Math.min(Math.log10(candidate.metrics.replyCount + 1) / 2.5, 1);

    // Final score: topic relevance (30%) + pain (50%) + engagement (20%)
    // Bonus for experienced pain, penalty for advice threads
    const experiencedBonus = hasExperiencedPain ? 15 : 0;
    const advicePenalty = (isAdviceThread && !isQuestion) ? -25 : 0;
    const questionBonus = (isQuestion && isOnTopic) ? 10 : 0;

    const score = Math.max(0, Math.round(
      (topicRelevance * 30) +
      (painScore * 50) +
      (engagementScore * 20) +
      experiencedBonus +
      advicePenalty +
      questionBonus
    ));

    const allMatches = [...topicMatches, ...painKeywordMatches, ...experiencedPainMatches.slice(0, 2)];

    return {
      id: candidate.id,
      url: `https://x.com/${candidate.authorUsername}/status/${candidate.id}`,
      text: candidate.text,
      author: {
        username: candidate.authorUsername,
        name: candidate.authorName,
        profileImage: candidate.authorProfileImage,
      },
      metrics: {
        replies: candidate.metrics.replyCount,
        likes: candidate.metrics.likeCount,
        retweets: candidate.metrics.retweetCount,
      },
      painSignal: {
        density: painScore,
        painCount: painKeywordMatches.length + experiencedPainMatches.length + genericPainMatches.length,
        sampleSize: 1,
        topPainQuote: candidate.text.substring(0, 200),
        matchedKeywords: allMatches.slice(0, 5),
      },
      score,
      whySurfaced: hasExperiencedPain
        ? `Real pain: "${experiencedPainMatches[0]}"`
        : isQuestion && isOnTopic
          ? `Question about topic: asking for help`
          : (isAdviceThread && !isQuestion)
            ? `⚠️ Advice thread (lower value)`
            : topicMatches.length > 0 && painKeywordMatches.length > 0
              ? `Topic: ${topicMatches.slice(0, 2).join(', ')} | Pain: ${painKeywordMatches.slice(0, 2).join(', ')}`
              : topicMatches.length > 0
                ? `Topic: ${topicMatches.slice(0, 3).join(', ')}`
                : genericPainMatches.length > 0
                  ? `Generic pain: ${genericPainMatches.slice(0, 2).join(', ')}`
                  : `${candidate.metrics.replyCount} replies`,
      createdAt: candidate.createdAt,
    };
  })
  // Filter out very low relevance results (lowered threshold for broader matching)
  .filter(thread => thread.score >= 10)
  .sort((a, b) => b.score - a.score);
}

// OpenRouter model IDs
const MODELS = {
  // Grok with web search for finding tweets directly
  webSearch: 'x-ai/grok-4.1-fast',
  // Use Haiku 4.5 for fast classification
  classifier: 'anthropic/claude-haiku-4.5',
} as const;

/**
 * Call OpenRouter AI model
 */
async function callModel(
  prompt: string,
  options: {
    model: string;
    webSearch?: boolean;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const body: Record<string, unknown> = {
    model: options.model,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert at analyzing social media for pain signals. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2000,
  };

  if (options.webSearch) {
    body.plugins = [{ id: 'web' }];
  }

  // Timeout: 20s for web search (Grok), 15s for classification
  const timeoutMs = options.webSearch ? 20000 : 15000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005',
        'X-Title': 'XThreadFinder',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Parse JSON from AI response
 */
function parseJSON<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response');
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * Step 1: Generate topic keywords AND pain keywords for classification
 */
async function generateKeywords(
  topic: string,
  onProgress?: FinderProgressCallback
): Promise<{ topicKeywords: string[]; painKeywords: string[] }> {
  onProgress?.({
    stage: 'generating_queries',
    current: 0,
    total: 1,
    message: 'Analyzing topic...',
  });

  const prompt = `For this topic, generate two sets of keywords:

Topic: "${topic}"

1. TOPIC KEYWORDS: 6-8 words/phrases that identify content ABOUT this topic (what makes something relevant)
2. PAIN KEYWORDS: 6-8 words that indicate frustration or problems WITH this topic

Example for "developers complaining about API documentation":
- Topic keywords: documentation, docs, API docs, readme, reference, tutorial, examples, code samples
- Pain keywords: outdated, confusing, incomplete, missing, wrong, unclear, nonexistent, terrible

Respond with ONLY valid JSON:
{
  "topicKeywords": ["documentation", "docs", "API docs", "readme", "reference", "tutorial"],
  "painKeywords": ["outdated", "confusing", "incomplete", "missing", "wrong", "unclear"]
}`;

  const response = await callModel(prompt, {
    model: MODELS.classifier,
    temperature: 0.3,
    maxTokens: 500,
  });

  // Lenient JSON parsing
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn('[Finder] No JSON in keywords response, using defaults');
    // Extract likely topic words from the input
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return {
      topicKeywords: topicWords.slice(0, 5),
      painKeywords: ['frustrated', 'struggling', 'hate', 'problem', 'issue', 'broken', 'sucks', 'failing'],
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { topicKeywords?: string[]; painKeywords?: string[] };
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return {
      topicKeywords: parsed.topicKeywords || topicWords.slice(0, 5),
      painKeywords: parsed.painKeywords || ['frustrated', 'struggling', 'hate', 'problem', 'issue', 'broken'],
    };
  } catch {
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return {
      topicKeywords: topicWords.slice(0, 5),
      painKeywords: ['frustrated', 'struggling', 'hate', 'problem', 'issue', 'broken', 'sucks', 'failing'],
    };
  }
}

/**
 * Get audience config from preset or custom
 */
function getAudienceConfig(preset?: AudiencePreset, custom?: Partial<AudienceConfig>): AudienceConfig | null {
  if (!preset || preset === 'custom') {
    if (custom) {
      return {
        preset: 'custom',
        keyAccounts: custom.keyAccounts || [],
        hashtags: custom.hashtags || [],
        communityIds: custom.communityIds || [],
        communityUrls: custom.communityUrls || [],
        identifyingKeywords: custom.identifyingKeywords || [],
      };
    }
    return null;
  }
  return AUDIENCE_PRESETS[preset];
}

/**
 * Extract key search terms from a topic
 * Converts "startup founders struggling to find customers" into ["startup", "founders", "customers", "find customers"]
 */
function extractSearchTerms(topic: string): string[] {
  // Remove common filler words
  const fillerWords = ['with', 'about', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'is', 'are', 'and', 'or'];
  const words = topic.toLowerCase().split(/\s+/).filter(w =>
    w.length > 2 && !fillerWords.includes(w)
  );

  // Create both individual terms and 2-word phrases
  const terms: string[] = [];

  // Add meaningful individual words
  for (const word of words) {
    if (word.length > 3) {
      terms.push(word);
    }
  }

  // Add 2-word phrases for better matching
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 2 && words[i + 1].length > 2) {
      terms.push(`${words[i]} ${words[i + 1]}`);
    }
  }

  return [...new Set(terms)].slice(0, 6); // Max 6 terms
}

/**
 * Generate natural language search angles for Grok web search.
 * Uses varied phrasings to maximize discovery. Each angle is a
 * plain-English description — NOT boolean search syntax.
 */
function generateSearchAngles(topic: string, audience?: AudienceConfig): string[] {
  const angles: string[] = [];

  // Angle 1: Direct topic as a struggle/question
  angles.push(`people struggling with ${topic}`);

  // Angle 2: Topic phrased as a help request
  angles.push(`${topic} need help or advice`);

  if (audience) {
    // Angle 3: Topic within audience community
    const audienceLabel = audience.identifyingKeywords.slice(0, 3).join(', ');
    angles.push(`${audienceLabel} discussing ${topic}`);

    // Angle 4: Broader frustration in audience
    angles.push(`frustrated with ${topic} startup founder or indie hacker`);
  } else {
    // Angle 3: Topic + frustration variant
    angles.push(`can't figure out ${topic}`);

    // Angle 4: Topic as a request for help
    angles.push(`anyone solved ${topic}`);
  }

  console.log('[Finder] Generated search angles:', angles);
  return angles.slice(0, 4);
}

/**
 * Single Grok search for one angle - with audience context
 */
async function grokSearchAngle(
  searchQuery: string,
  minReplies: number,
  audience?: AudienceConfig
): Promise<Array<{
  url: string;
  text: string;
  authorUsername: string;
  authorName?: string;
  replyCount?: number;
  likeCount?: number;
  retweetCount?: number;
  painSignal?: string;
}>> {
  // Add audience context to the prompt
  let audienceContext = '';
  if (audience) {
    const communityInfo = audience.communityUrls?.length
      ? `\nX Communities: ${audience.communityUrls.join(', ')}`
      : '';

    audienceContext = `
AUDIENCE CONTEXT: Focus on the ${audience.preset} community on X/Twitter.
These are people building startups, SaaS, side projects, or micro-businesses.
They often use terms like: ${audience.identifyingKeywords.slice(0, 5).join(', ')}
They may follow accounts like: ${audience.keyAccounts.slice(0, 4).map(a => '@' + a).join(', ')}
${communityInfo}

Prefer tweets from this community, but don't exclude a great match just because the author doesn't explicitly identify as part of this group.
`;
  }

  const prompt = `Search X/Twitter for: "${searchQuery}"
${audienceContext}
Find 15 recent tweets (last 14 days) that are relevant to this topic.

SEARCH PRIORITIES (in order of preference):
1. BEST: Someone EXPERIENCING the problem first-hand ("I'm struggling with...", "I can't figure out...", "Help?")
2. GOOD: Someone ASKING a question about this topic ("How do I...", "Anyone know...", "What's the best way to...")
3. OK: Active discussion threads where people share frustrations or debate solutions
4. AVOID: Pure advice threads ("Here's how to...", "Pro tip:"), news articles, promotional content

Include tweets even if they only have a few replies — engagement quality matters more than quantity.
Don't limit to exact phrasing. Include tweets that discuss the same underlying problem in different words.

Return ONLY valid JSON:
{"tweets":[{"url":"https://x.com/user/status/ID","text":"full tweet text","authorUsername":"user","authorName":"Display Name","replyCount":10,"likeCount":25,"retweetCount":5,"painSignal":"what problem or question they're expressing"}]}

If you truly cannot find any relevant tweets, return: {"tweets":[]}`;

  try {
    console.log('[Finder] Search query:', searchQuery.substring(0, 80));
    const response = await callModel(prompt, {
      model: MODELS.webSearch,
      webSearch: true,
      temperature: 0.5,
      maxTokens: 2500,
    });

    console.log('[Finder] Search response length:', response.length);

    // Lenient JSON parsing
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[Finder] ❌ No JSON in search response');
      console.warn('[Finder] Full search response:', response.substring(0, 1000));
      return [];
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as { tweets?: Array<{
        url: string;
        text: string;
        authorUsername: string;
        authorName?: string;
        replyCount?: number;
        likeCount?: number;
        retweetCount?: number;
        painSignal?: string;
      }> };
      return parsed.tweets || [];
    } catch (parseError) {
      console.warn('[Finder] JSON parse error for search:', searchQuery.substring(0, 50));
      return [];
    }
  } catch (error) {
    console.warn(`[Finder] Search angle failed:`, error);
    return [];
  }
}

/**
 * Step 2: Find candidate threads using parallel Grok web searches
 * Runs multiple searches simultaneously for different angles of the topic
 */
async function findCandidatesWithGrok(
  topic: string,
  minReplies: number,
  audience?: AudienceConfig,
  onProgress?: FinderProgressCallback
): Promise<ThreadCandidate[]> {
  const audienceLabel = audience ? `(${audience.preset})` : '(general)';
  onProgress?.({
    stage: 'fetching_candidates',
    current: 1,
    total: 1,
    message: `Searching X ${audienceLabel}...`,
  });

  const searchAngles = generateSearchAngles(topic, audience);
  console.log(`[Finder] Running ${searchAngles.length} parallel Grok searches for ${audienceLabel}...`);
  console.log('[Finder] Search angles:', searchAngles);

  // Run all searches in parallel for speed
  const searchPromises = searchAngles.map(angle => grokSearchAngle(angle, minReplies, audience));
  const results = await Promise.all(searchPromises);

  // Flatten and dedupe by tweet ID (extracted from URL)
  const seenIds = new Set<string>();
  const allTweets: Array<{
    url: string;
    text: string;
    authorUsername: string;
    authorName?: string;
    replyCount?: number;
    likeCount?: number;
    retweetCount?: number;
    painSignal?: string;
  }> = [];

  for (const tweets of results) {
    for (const tweet of tweets) {
      const idMatch = tweet.url.match(/status\/(\d+)/);
      const tweetId = idMatch ? idMatch[1] : tweet.url;
      if (!seenIds.has(tweetId)) {
        seenIds.add(tweetId);
        allTweets.push(tweet);
      }
    }
  }

  console.log(`[Finder] Grok found ${allTweets.length} unique threads across all searches`);

  if (allTweets.length === 0) {
    return [];
  }

  // Convert to ThreadCandidate format
  const candidates: ThreadCandidate[] = [];

  for (const tweet of allTweets) {
    const match = tweet.url.match(/status\/(\d+)/);
    if (!match) {
      console.warn(`[Finder] Invalid tweet URL: ${tweet.url}`);
      continue;
    }
    const tweetId = match[1];
    const replyCount = tweet.replyCount;
    const replyCountKnown = replyCount !== undefined && replyCount !== null;

    // If reply count is unknown (Grok couldn't determine), let it through.
    // If known and below minimum, skip it.
    if (replyCountKnown && replyCount < minReplies) {
      console.log(`[Finder] Skipped: @${tweet.authorUsername} (${replyCount} replies < ${minReplies} min)`);
      continue;
    }

    candidates.push({
      id: tweetId,
      text: tweet.text,
      authorUsername: tweet.authorUsername,
      authorName: tweet.authorName || tweet.authorUsername,
      authorProfileImage: undefined,
      conversationId: tweetId,
      createdAt: new Date().toISOString(),
      metrics: {
        replyCount: replyCount ?? 0,
        likeCount: tweet.likeCount ?? 0,
        retweetCount: tweet.retweetCount ?? 0,
      },
    });
    console.log(`[Finder] Added: @${tweet.authorUsername} (${replyCountKnown ? replyCount + ' replies' : 'reply count unknown'})`);
  }

  console.log(`[Finder] Total valid candidates: ${candidates.length}`);
  return candidates;
}

/**
 * Sample replies using Grok web search (no X API) - optimized prompt
 */
async function sampleRepliesWithGrok(
  tweetUrl: string,
  tweetText: string,
  sampleSize: number
): Promise<Array<{ id: string; text: string; authorUsername: string }>> {
  // Shorter, faster prompt
  const prompt = `Get ${sampleSize} replies to this tweet: ${tweetUrl}
Skip short replies like "this!" or emojis. Return ONLY valid JSON, nothing else:
{"replies":[{"id":"1","text":"reply text","authorUsername":"user"}]}

If you cannot find replies, return: {"replies":[]}`;

  try {
    console.log('[Finder] Fetching replies for:', tweetUrl);
    const response = await callModel(prompt, {
      model: MODELS.webSearch,
      webSearch: true,
      temperature: 0.2,
      maxTokens: 2000,
    });

    console.log('[Finder] Grok reply response length:', response.length);
    console.log('[Finder] Grok reply response preview:', response.substring(0, 500));

    // Try to parse JSON, but be lenient
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // No JSON found - log what Grok actually returned
      console.warn('[Finder] ❌ No JSON found in reply response');
      console.warn('[Finder] Full response:', response);
      return [];
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        replies?: Array<{ id: string; text: string; authorUsername: string }>;
      };
      return (parsed.replies || []).slice(0, sampleSize);
    } catch (parseError) {
      console.warn('[Finder] JSON parse error for replies:', tweetUrl);
      return [];
    }
  } catch (error) {
    console.warn('[Finder] Grok reply fetch failed for:', tweetUrl);
    return [];
  }
}

/**
 * Batch fetch replies for multiple threads in parallel
 */
async function batchFetchReplies(
  candidates: ThreadCandidate[],
  sampleSize: number
): Promise<Map<string, Array<{ id: string; text: string; authorUsername: string }>>> {
  const results = new Map<string, Array<{ id: string; text: string; authorUsername: string }>>();

  // Process in parallel batches of 5
  const BATCH_SIZE = 5;

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (candidate) => {
      const tweetUrl = `https://x.com/${candidate.authorUsername}/status/${candidate.id}`;
      const replies = await sampleRepliesWithGrok(tweetUrl, candidate.text, sampleSize);
      return { id: candidate.id, replies };
    });

    const batchResults = await Promise.all(promises);
    for (const { id, replies } of batchResults) {
      results.set(id, replies);
    }
  }

  return results;
}

/**
 * Step 3: Stage 1 Cheap Pain Scan
 * Sample 8-10 replies per candidate, lightweight classification
 */
async function stage1CheapScan(
  candidates: ThreadCandidate[],
  painKeywords: string[],
  onProgress?: FinderProgressCallback
): Promise<Array<{ candidate: ThreadCandidate; samples: ClassifiedSample[]; painDensity: number }>> {
  const results: Array<{ candidate: ThreadCandidate; samples: ClassifiedSample[]; painDensity: number }> = [];

  const BATCH_SIZE = 10;
  const SAMPLE_SIZE = 8;

  onProgress?.({
    stage: 'stage1_scan',
    current: 0,
    total: candidates.length,
    message: `Stage 1: Fetching replies for ${candidates.length} threads in parallel...`,
  });

  // Fetch all replies in parallel batches first (faster)
  console.log(`[Finder] Stage 1: Fetching replies for ${candidates.length} candidates in parallel...`);
  const repliesMap = await batchFetchReplies(candidates, SAMPLE_SIZE);

  // Build batch with replies
  const batchWithReplies: Array<{
    candidate: ThreadCandidate;
    replies: Array<{ id: string; text: string; authorUsername: string }>;
  }> = [];

  for (const candidate of candidates) {
    const replies = repliesMap.get(candidate.id) || [];
    if (replies.length > 0) {
      batchWithReplies.push({ candidate, replies });
    }
  }

  console.log(`[Finder] Stage 1: Got replies for ${batchWithReplies.length} threads`);

  // Now classify in batches
  for (let i = 0; i < batchWithReplies.length; i += BATCH_SIZE) {
    const batch = batchWithReplies.slice(i, i + BATCH_SIZE);

    onProgress?.({
      stage: 'stage1_scan',
      current: Math.min(i + BATCH_SIZE, batchWithReplies.length),
      total: batchWithReplies.length,
      message: `Stage 1: Classifying batch ${Math.floor(i / BATCH_SIZE) + 1}...`,
    });

    if (batch.length === 0) continue;

    // Build prompt for batch classification
    const threadsForClassification = batch.map((item, idx) => ({
      thread_index: idx,
      tweet_text: item.candidate.text.substring(0, 300),
      replies: item.replies.map((r) => ({
        id: r.id,
        text: r.text.substring(0, 200),
        author: r.authorUsername,
      })),
    }));

    const prompt = `Quickly classify replies in these threads for pain signals.

Pain keywords to look for: ${painKeywords.join(', ')}

For each reply, classify as:
- pain: frustration, problem, unmet need, complaint
- not_pain: everything else (curiosity, praise, joke, neutral)

Threads to analyze:
${JSON.stringify(threadsForClassification, null, 2)}

Respond with ONLY valid JSON:
{
  "threads": [
    {
      "thread_index": 0,
      "classifications": [
        { "reply_id": "123", "is_pain": true, "key_quote": "most important phrase" }
      ]
    }
  ]
}`;

    try {
      const response = await callModel(prompt, {
        model: MODELS.classifier,
        temperature: 0.2,
        maxTokens: 3000,
      });

      // Lenient JSON parsing
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('[Finder] Stage 1: No JSON in classification response');
        continue;
      }

      let parsed: {
        threads: Array<{
          thread_index: number;
          classifications: Array<{
            reply_id: string;
            is_pain: boolean;
            key_quote?: string;
          }>;
        }>;
      };

      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn('[Finder] Stage 1: JSON parse error');
        continue;
      }

      // Process results
      for (const threadResult of parsed.threads || []) {
        const item = batch[threadResult.thread_index];
        if (!item) continue;

        const samples: ClassifiedSample[] = threadResult.classifications.map((c) => {
          const reply = item.replies.find((r) => r.id === c.reply_id) || item.replies[0];
          return {
            id: c.reply_id,
            text: reply?.text || '',
            authorUsername: reply?.authorUsername || '',
            isPain: c.is_pain,
            classification: c.is_pain ? 'pain' : 'fluff',
            keyQuote: c.key_quote,
          };
        });

        const painDensity = calculatePainDensity(samples);
        results.push({
          candidate: item.candidate,
          samples,
          painDensity,
        });
      }
    } catch (error) {
      console.warn('[Finder] Stage 1 batch classification failed', error);
    }
  }

  // Sort by pain density descending
  return results.sort((a, b) => b.painDensity - a.painDensity);
}

/**
 * Step 4: Stage 2 Deep Pain Scan
 * Full classification on top pain-scoring threads (parallel fetch)
 */
async function stage2DeepScan(
  stage1Results: Array<{ candidate: ThreadCandidate; samples: ClassifiedSample[]; painDensity: number }>,
  painKeywords: string[],
  topN: number = 10, // Reduced from 15 for speed
  onProgress?: FinderProgressCallback
): Promise<Array<{ candidate: ThreadCandidate; samples: ClassifiedSample[] }>> {
  const topCandidates = stage1Results.slice(0, topN);
  const results: Array<{ candidate: ThreadCandidate; samples: ClassifiedSample[] }> = [];

  const DEEP_SAMPLE_SIZE = 15; // Reduced from 25 for speed

  onProgress?.({
    stage: 'stage2_scan',
    current: 0,
    total: topCandidates.length,
    message: `Stage 2: Deep scanning top ${topCandidates.length} threads...`,
  });

  // Fetch all replies in parallel first
  console.log(`[Finder] Stage 2: Fetching replies for ${topCandidates.length} threads in parallel...`);
  const candidatesOnly = topCandidates.map(t => t.candidate);
  const repliesMap = await batchFetchReplies(candidatesOnly, DEEP_SAMPLE_SIZE);

  // Now classify each
  for (let i = 0; i < topCandidates.length; i++) {
    const { candidate, samples: stage1Samples } = topCandidates[i];
    const replies = repliesMap.get(candidate.id) || [];

    onProgress?.({
      stage: 'stage2_scan',
      current: i + 1,
      total: topCandidates.length,
      message: `Stage 2: Classifying ${i + 1}/${topCandidates.length}...`,
    });

    if (replies.length === 0) {
      // Fall back to Stage 1 samples
      results.push({ candidate, samples: stage1Samples });
      continue;
    }

    try {
      // Full classification prompt
      const prompt = `Classify these replies to a tweet for pain signals.

Pain keywords: ${painKeywords.join(', ')}

Tweet: "${candidate.text}"

Replies to classify:
${JSON.stringify(replies.map((r) => ({ id: r.id, text: r.text.substring(0, 300), author: r.authorUsername })), null, 2)}

For each reply, classify as:
- pain: expressing frustration, a specific problem, or unmet need
- curiosity: asking questions, wants to learn more
- objection: doubt, pushback, skepticism
- fluff: generic praise, joke, low-value

Respond with ONLY valid JSON:
{
  "classifications": [
    {
      "reply_id": "123",
      "author": "username",
      "classification": "pain|curiosity|objection|fluff",
      "is_pain": true,
      "key_quote": "most important phrase if pain"
    }
  ]
}`;

      const response = await callModel(prompt, {
        model: MODELS.classifier,
        temperature: 0.2,
        maxTokens: 4000,
      });

      // Lenient JSON parsing
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('[Finder] Stage 2: No JSON in classification response');
        results.push({ candidate, samples: stage1Samples });
        continue;
      }

      let parsed: {
        classifications: Array<{
          reply_id: string;
          author: string;
          classification: 'pain' | 'curiosity' | 'objection' | 'fluff';
          is_pain: boolean;
          key_quote?: string;
        }>;
      };

      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn('[Finder] Stage 2: JSON parse error');
        results.push({ candidate, samples: stage1Samples });
        continue;
      }

      const samples: ClassifiedSample[] = (parsed.classifications || []).map((c) => ({
        id: c.reply_id,
        text: replies.find((r) => r.id === c.reply_id)?.text || '',
        authorUsername: c.author,
        isPain: c.is_pain,
        classification: c.classification,
        keyQuote: c.key_quote,
      }));

      results.push({ candidate, samples });
    } catch (error) {
      console.warn(`[Finder] Stage 2 scan failed for ${candidate.id}`, error);
      // Fall back to Stage 1 samples
      results.push({ candidate, samples: stage1Samples });
    }
  }

  return results;
}

/**
 * Main XThreadFinder function
 */
export async function findThreadsWithPain(
  input: FinderInput,
  onProgress?: FinderProgressCallback
): Promise<FinderResult> {
  const rateLimiter = getRateLimiter();

  // Check if we have budget
  if (!rateLimiter.hasFinderBudget()) {
    return {
      success: false,
      threads: [],
      queryUsed: [],
      topicKeywords: [],
      painKeywords: [],
      stats: {
        candidatesFetched: 0,
        stage1Scanned: 0,
        stage2Scanned: 0,
        totalApiReads: 0,
      },
      rateLimitStatus: rateLimiter.getStatus(),
      error: 'Monthly API budget exceeded. Try again next month.',
    };
  }

  try {
    // Get audience config if specified
    const audienceConfig = getAudienceConfig(input.audience, input.customAudience);
    if (audienceConfig) {
      console.log(`[Finder] Targeting audience: ${audienceConfig.preset}`);
      console.log(`[Finder] Key accounts: ${audienceConfig.keyAccounts.slice(0, 5).join(', ')}`);
    }

    // Steps 1 & 2 run in PARALLEL — keywords are only needed for scoring (Step 3),
    // not for the Grok web search, so there's no dependency between them.
    console.log('[Finder] ========================================');
    console.log('[Finder] TOPIC INPUT:', input.topic);
    console.log('[Finder] AUDIENCE:', input.audience || 'none');
    console.log('[Finder] ========================================');

    const keywordsFallback = {
      topicKeywords: input.topic.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5),
      painKeywords: ['frustrated', 'struggling', 'hate', 'problem', 'issue', 'broken', 'sucks', 'failing'],
    };

    const [keywordsResult, candidatesResult] = await Promise.allSettled([
      generateKeywords(input.topic, onProgress),
      findCandidatesWithGrok(
        input.topic,
        input.minReplies ?? 2,
        audienceConfig || undefined,
        onProgress
      ),
    ]);

    // Extract keywords (use fallback if failed)
    let topicKeywords: string[];
    let painKeywords: string[];
    if (keywordsResult.status === 'fulfilled') {
      topicKeywords = keywordsResult.value.topicKeywords;
      painKeywords = keywordsResult.value.painKeywords;
      console.log('[Finder] Topic keywords:', topicKeywords);
      console.log('[Finder] Pain keywords:', painKeywords);
    } else {
      console.error('[Finder] Keyword generation failed:', keywordsResult.reason);
      topicKeywords = keywordsFallback.topicKeywords;
      painKeywords = keywordsFallback.painKeywords;
    }

    // Extract candidates (throw if failed)
    let candidates: ThreadCandidate[];
    if (candidatesResult.status === 'fulfilled') {
      candidates = candidatesResult.value;
      console.log(`[Finder] Found ${candidates.length} candidates via Grok`);
    } else {
      console.error('[Finder] Candidate search failed:', candidatesResult.reason);
      throw new Error(`Failed to find candidates: ${candidatesResult.reason instanceof Error ? candidatesResult.reason.message : 'Unknown error'}`);
    }

    if (candidates.length === 0) {
      return {
        success: true,
        threads: [],
        queryUsed: [input.topic],
        topicKeywords,
        painKeywords,
        stats: {
          candidatesFetched: 0,
          stage1Scanned: 0,
          stage2Scanned: 0,
          totalApiReads: 0,
        },
        rateLimitStatus: rateLimiter.getStatus(),
      };
    }

    // Step 3: FAST scoring - analyze tweet text for topic AND pain keywords (no API calls)
    // Deep reply analysis happens later in triage when user clicks "Analyze Thread"
    onProgress?.({
      stage: 'scoring',
      current: 1,
      total: 1,
      message: 'Scoring threads for relevance...',
    });

    // Combine AI-generated topic keywords with extracted search terms for broader matching
    const searchTerms = extractSearchTerms(input.topic);
    const allTopicKeywords = [...new Set([...topicKeywords, ...searchTerms])];
    console.log('[Finder] All topic keywords for scoring:', allTopicKeywords);

    const scoredThreads = quickScoreFromText(candidates, allTopicKeywords, painKeywords);
    const topThreads = scoredThreads.slice(0, 15);

    console.log(`[Finder] After filtering: ${scoredThreads.length} relevant threads (from ${candidates.length} candidates)`);

    console.log(`[Finder] ✅ Done! Found ${topThreads.length} threads`);

    return {
      success: true,
      threads: topThreads,
      queryUsed: [input.topic],
      topicKeywords,
      painKeywords,
      stats: {
        candidatesFetched: candidates.length,
        stage1Scanned: candidates.length,
        stage2Scanned: 0, // Deep scan happens in triage
        totalApiReads: 0,
      },
      rateLimitStatus: rateLimiter.getStatus(),
    };
  } catch (error) {
    console.error('[Finder] Error:', error);
    return {
      success: false,
      threads: [],
      queryUsed: [],
      topicKeywords: [],
      painKeywords: [],
      stats: {
        candidatesFetched: 0,
        stage1Scanned: 0,
        stage2Scanned: 0,
        totalApiReads: 0,
      },
      rateLimitStatus: rateLimiter.getStatus(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
