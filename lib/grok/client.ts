import {
  CLASSIFICATION_PROMPT,
  PAIN_EXTRACTION_PROMPT,
  CONTENT_GENERATION_PROMPT,
  FETCH_TWEET_PROMPT,
  FETCH_REDDIT_PROMPT,
  REDDIT_CLASSIFICATION_PROMPT,
  REDDIT_CONTENT_GENERATION_PROMPT,
  buildPrompt,
} from './prompts';
import type {
  Reply,
  ClassifiedReply,
  AnalysisSummary,
  PainPoint,
  DMCandidate,
  ReplyDraft,
  DMTemplate,
  GeneratedPost,
  AnalysisGoal,
  RedditComment,
  ClassifiedRedditComment,
  RedditPost,
} from '@/types/triage';

// Model selection for different tasks (OpenRouter model IDs)
// Using faster models where accuracy is less critical
const MODELS = {
  webSearch: 'x-ai/grok-4.1-fast',                    // Only model with web search plugin
  classification: 'anthropic/claude-haiku-4.5',       // Fastest model for structured JSON
  contentGen: 'anthropic/claude-sonnet-4.5',          // Latest Sonnet for quality writing
  analysis: 'anthropic/claude-haiku-4.5',             // Fastest model for extraction
} as const;

type TaskType = keyof typeof MODELS;

export class GrokClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  private async callModel(
    prompt: string,
    options?: {
      task?: TaskType;
      webSearch?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const task = options?.task || (options?.webSearch ? 'webSearch' : 'classification');
    const model = MODELS[task];

    const startTime = Date.now();
    console.log(`[AI] Starting ${task} with model: ${model}`);

    const body: Record<string, unknown> = {
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing social media engagement. Always respond with valid JSON only, no markdown or extra text. Ensure all JSON is properly formatted with escaped quotes in strings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? (options?.webSearch ? 0.2 : 0.3),
      max_tokens: options?.maxTokens ?? (options?.webSearch ? 16000 : 4000),
    };

    // Enable web search plugin (only works with Grok)
    if (options?.webSearch) {
      body.plugins = [{ id: 'web' }];
    }

    // Add timeout for web search requests (they can take longer)
    const controller = new AbortController();
    const timeoutMs = options?.webSearch ? 120000 : 60000; // 2 min for web search, 1 min otherwise
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005',
          'X-Title': 'Reply Triage Copilot',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        console.error('[AI] Unexpected response structure:', JSON.stringify(data).substring(0, 500));
        throw new Error('Invalid response from AI model');
      }

      const content = data.choices[0].message.content;
      const finishReason = data.choices[0].finish_reason;
      const usage = data.usage;

      const elapsed = Date.now() - startTime;
      console.log(`[AI] ✓ ${task} done in ${elapsed}ms (${content.length} chars, ${usage?.completion_tokens || '?'} tokens)`);

      if (finishReason === 'length') {
        console.warn('[AI] Response was truncated due to max_tokens limit!');
      }

      return content;
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000}s. Web search may be slow - try again.`);
      }
      throw error;
    }
  }

  // Backwards compatible alias
  private async callGrok(prompt: string, options?: { webSearch?: boolean }): Promise<string> {
    return this.callModel(prompt, { ...options, task: options?.webSearch ? 'webSearch' : 'classification' });
  }

  private parseJSON<T>(text: string): T {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Grok] No JSON found in response:', text.substring(0, 500));
      throw new Error('No JSON found in response');
    }

    let jsonStr = jsonMatch[0];

    try {
      return JSON.parse(jsonStr);
    } catch (firstError) {
      // Try to fix common JSON issues
      console.warn('[Grok] First JSON parse failed, attempting fixes...');

      // Fix 1: Remove trailing commas before ] or }
      jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

      // Fix 2: Escape unescaped newlines and tabs within strings
      jsonStr = jsonStr.replace(/(?<!\\)\\n/g, '\\n');
      jsonStr = jsonStr.replace(/(?<!\\)\\t/g, '\\t');

      // Fix 3: Remove control characters that break JSON
      jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (match) => {
        if (match === '\n' || match === '\r' || match === '\t') {
          return match; // Keep newlines/tabs
        }
        return ''; // Remove other control chars
      });

      // Fix 4: Try to repair truncated JSON by finding the last complete object
      let braceCount = 0;
      let bracketCount = 0;
      let lastValidEnd = -1;
      let inString = false;
      let escape = false;

      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];

        if (escape) {
          escape = false;
          continue;
        }

        if (char === '\\') {
          escape = true;
          continue;
        }

        if (char === '"' && !escape) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') braceCount++;
          else if (char === '}') {
            braceCount--;
            if (braceCount === 0 && bracketCount === 0) {
              lastValidEnd = i;
              break;
            }
          } else if (char === '[') bracketCount++;
          else if (char === ']') bracketCount--;
        }
      }

      if (lastValidEnd > 0) {
        jsonStr = jsonStr.substring(0, lastValidEnd + 1);
      }

      try {
        return JSON.parse(jsonStr);
      } catch (secondError) {
        // Last resort: Try to extract just the essential data
        console.error('[Grok] JSON parse failed. Error position:', (secondError as Error).message);
        console.error('[Grok] First 2000 chars:', jsonStr.substring(0, 2000));
        throw new Error(`Failed to parse JSON: ${firstError instanceof Error ? firstError.message : 'Unknown error'}`);
      }
    }
  }

  async fetchTweetFromUrl(tweetUrl: string): Promise<{
    tweet: {
      text: string;
      authorHandle: string;
      authorName: string;
      likes: number;
      retweets: number;
      replyCount: number;
    };
    replies: Reply[];
  }> {
    const prompt = buildPrompt(FETCH_TWEET_PROMPT, {
      tweet_url: tweetUrl,
    });

    const response = await this.callGrok(prompt, { webSearch: true });

    // Try to parse the response with enhanced error recovery
    let parsed: {
      tweet?: {
        text: string;
        author_handle: string;
        author_name: string;
        likes: number;
        retweets: number;
        reply_count: number;
      };
      replies?: Array<{
        id: string;
        text: string;
        author_handle: string;
        author_name: string;
        likes: number;
      }>;
      error?: string;
    };

    try {
      parsed = this.parseJSON(response);
    } catch (parseError) {
      // Try to extract tweet and as many valid replies as possible from truncated JSON
      console.warn('[Grok] Full parse failed, attempting partial extraction...');

      // Extract tweet object
      const tweetMatch = response.match(/"tweet"\s*:\s*(\{[\s\S]*?"reply_count"\s*:\s*\d+\s*\})/);
      let tweet = null;
      if (tweetMatch) {
        try {
          tweet = JSON.parse(tweetMatch[1]);
        } catch {
          // Try simpler extraction
          const simpleTweetMatch = response.match(/"tweet"\s*:\s*\{([^}]+)\}/);
          if (simpleTweetMatch) {
            try {
              tweet = JSON.parse(`{${simpleTweetMatch[1]}}`);
            } catch {
              console.error('[Grok] Could not extract tweet');
            }
          }
        }
      }

      // Extract individual reply objects from the array
      const replies: Array<{
        id: string;
        text: string;
        author_handle: string;
        author_name: string;
        likes: number;
      }> = [];

      // Find the replies array and extract each complete reply object
      const repliesArrayMatch = response.match(/"replies"\s*:\s*\[/);
      if (repliesArrayMatch && repliesArrayMatch.index !== undefined) {
        const repliesStart = repliesArrayMatch.index + repliesArrayMatch[0].length;
        const repliesSection = response.substring(repliesStart);

        // Match each complete reply object
        const replyPattern = /\{\s*"id"\s*:\s*"[^"]*"\s*,\s*"text"\s*:\s*"[^"]*"\s*,\s*"author_handle"\s*:\s*"[^"]*"\s*,\s*"author_name"\s*:\s*"[^"]*"\s*,\s*"likes"\s*:\s*\d+\s*\}/g;
        let match;
        while ((match = replyPattern.exec(repliesSection)) !== null) {
          try {
            const reply = JSON.parse(match[0]);
            replies.push(reply);
          } catch {
            // Skip malformed reply
          }
        }

        console.log(`[Grok] Extracted ${replies.length} complete replies from truncated JSON`);
      }

      if (tweet) {
        parsed = { tweet, replies };
      } else {
        throw parseError; // Re-throw original error if we couldn't get tweet
      }
    }

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    if (!parsed.tweet) {
      throw new Error('Failed to fetch tweet data');
    }

    // Handle missing or corrupted replies gracefully
    const replies = parsed.replies || [];

    return {
      tweet: {
        text: parsed.tweet.text || '',
        authorHandle: parsed.tweet.author_handle || '',
        authorName: parsed.tweet.author_name || '',
        likes: parsed.tweet.likes || 0,
        retweets: parsed.tweet.retweets || 0,
        replyCount: parsed.tweet.reply_count || 0,
      },
      replies: replies.map((r, index) => ({
        id: r.id || `reply-${index}`,
        text: r.text || '',
        authorHandle: r.author_handle || '',
        authorName: r.author_name || '',
        likes: r.likes || 0,
      })),
    };
  }

  // Sanitize text to prevent JSON parsing issues
  private sanitizeText(text: string): string {
    return text
      // Remove or replace problematic characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Control characters
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/"/g, '\\"') // Escape quotes (will be unescaped by JSON.stringify)
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .trim();
  }

  async classifyReplies(
    tweetText: string,
    replies: Reply[]
  ): Promise<{
    classifiedReplies: ClassifiedReply[];
    summary: AnalysisSummary;
  }> {
    // Sanitize and prepare replies - limit text length to avoid issues
    const sanitizedReplies = replies.map((r, i) => ({
      index: i,
      author: r.authorHandle.replace(/[^a-zA-Z0-9_]/g, ''),
      text: r.text.substring(0, 500), // Limit text length
    }));

    // Process in batches if there are many replies
    const BATCH_SIZE = 30;
    let allClassifications: Array<{
      reply_index: number;
      author_handle: string;
      type: string;
      intent_score: number;
      key_quote: string;
      suggested_action: string;
      reason?: string;
    }> = [];

    for (let i = 0; i < sanitizedReplies.length; i += BATCH_SIZE) {
      const batch = sanitizedReplies.slice(i, i + BATCH_SIZE);
      const batchWithAdjustedIndex = batch.map((r, batchIdx) => ({
        ...r,
        index: i + batchIdx, // Maintain original index
      }));

      const repliesJson = JSON.stringify(batchWithAdjustedIndex);

      const prompt = buildPrompt(CLASSIFICATION_PROMPT, {
        tweet_text: tweetText.substring(0, 500),
        replies_json: repliesJson,
        reply_count: String(batch.length),
      });

      // Use Claude for reliable JSON classification - increase tokens for larger batches
      const response = await this.callModel(prompt, {
        task: 'classification',
        maxTokens: Math.max(4000, batch.length * 200), // ~200 tokens per classification
      });
      const parsed = this.parseJSON<{
        classifications: Array<{
          reply_index: number;
          author_handle: string;
          type: string;
          intent_score: number;
          key_quote: string;
          suggested_action: string;
          reason?: string;
        }>;
        summary: {
          total_replies: number;
          pain_count: number;
          curiosity_count: number;
          fluff_count: number;
          objection_count: number;
          top_objection?: string;
          top_pain_point?: string;
        };
      }>(response);

      // Check if any replies were missed and fill in with defaults
      const classifiedIndices = new Set(parsed.classifications.map(c => c.reply_index));
      for (const reply of batchWithAdjustedIndex) {
        if (!classifiedIndices.has(reply.index)) {
          console.warn(`[Grok] Reply ${reply.index} was not classified, adding default`);
          parsed.classifications.push({
            reply_index: reply.index,
            author_handle: reply.author,
            type: 'fluff',
            intent_score: 3,
            key_quote: reply.text.substring(0, 100),
            suggested_action: 'Ignore',
            reason: 'Auto-classified (missed by AI)',
          });
        }
      }

      allClassifications = allClassifications.concat(parsed.classifications);
    }

    // Build final summary from all classifications
    const painCount = allClassifications.filter((c) => c.type === 'pain').length;
    const curiosityCount = allClassifications.filter((c) => c.type === 'curiosity').length;
    const fluffCount = allClassifications.filter((c) => c.type === 'fluff').length;
    const objectionCount = allClassifications.filter((c) => c.type === 'objection').length;

    const topPainReply = allClassifications.find((c) => c.type === 'pain');
    const topObjectionReply = allClassifications.find((c) => c.type === 'objection');

    const classifiedReplies: ClassifiedReply[] = allClassifications.map((c) => {
      const originalReply = replies[c.reply_index] || replies[0];
      return {
        ...originalReply,
        classification: c.type as ClassifiedReply['classification'],
        intentScore: c.intent_score,
        keyQuote: c.key_quote,
        suggestedAction: c.suggested_action as ClassifiedReply['suggestedAction'],
        reason: c.reason,
      };
    });

    return {
      classifiedReplies,
      summary: {
        totalReplies: replies.length,
        painCount,
        curiosityCount,
        fluffCount,
        objectionCount,
        topObjection: topObjectionReply?.key_quote,
        topPainPoint: topPainReply?.key_quote,
      },
    };
  }

  async extractPainPoints(painReplies: ClassifiedReply[]): Promise<{
    painPoints: PainPoint[];
    keywords: string[];
    impliedSolutions: string[];
    dmCandidates: DMCandidate[];
  }> {
    const repliesText = painReplies
      .map((r) => `@${r.authorHandle}: "${r.text}"`)
      .join('\n');

    const prompt = buildPrompt(PAIN_EXTRACTION_PROMPT, {
      pain_replies: repliesText,
    });

    // Use fast analysis model for pain extraction
    const response = await this.callModel(prompt, { task: 'analysis' });
    const parsed = this.parseJSON<{
      pain_points: Array<{ pain: string; frequency: string; urgency: string }>;
      keywords: string[];
      implied_solutions: string[];
      dm_worthy: Array<{ handle: string; reason: string; intent_score: number }>;
    }>(response);

    return {
      painPoints: parsed.pain_points.map((p) => ({
        pain: p.pain,
        frequency: p.frequency,
        urgency: p.urgency as PainPoint['urgency'],
      })),
      keywords: parsed.keywords,
      impliedSolutions: parsed.implied_solutions,
      dmCandidates: parsed.dm_worthy.map((d) => ({
        handle: d.handle,
        reason: d.reason,
        intentScore: d.intent_score,
        originalReply: painReplies.find(
          (r) => r.authorHandle.toLowerCase() === d.handle.toLowerCase().replace('@', '')
        )?.text,
      })),
    };
  }

  async generateContent(
    tweetText: string,
    painPoints: PainPoint[],
    topObjection: string | undefined,
    goal: AnalysisGoal,
    voiceStyle?: string
  ): Promise<{
    replyDrafts: ReplyDraft[];
    dmTemplates: DMTemplate[];
    objectionPost?: GeneratedPost;
    tomorrowPost?: GeneratedPost;
  }> {
    const goalMap: Record<AnalysisGoal, string> = {
      get_replies: 'maximize engagement and replies',
      get_clicks: 'drive clicks to a link or product',
      pre_sell: 'warm up leads for a future launch',
    };

    const prompt = buildPrompt(CONTENT_GENERATION_PROMPT, {
      voice_style: voiceStyle || 'friendly, helpful, concise - like talking to a smart friend',
      tweet_text: tweetText,
      goal: goalMap[goal],
      pain_points: painPoints.map((p) => p.pain).join(', ') || 'none identified',
      top_objection: topObjection || 'none identified',
    });

    // Use content generation model for creative writing
    const response = await this.callModel(prompt, { task: 'contentGen', temperature: 0.7 });
    const parsed = this.parseJSON<{
      reply_drafts: Array<{
        to_handle: string;
        original_reply: string;
        draft: string;
        why: string;
      }>;
      dm_templates: Array<{ to_handle: string; template: string; goal: string }>;
      objection_post: { post: string; addresses: string };
      tomorrow_post: { post: string; hook: string };
    }>(response);

    return {
      replyDrafts: parsed.reply_drafts.map((r) => ({
        toHandle: r.to_handle,
        originalReply: r.original_reply,
        draft: r.draft,
        why: r.why,
      })),
      dmTemplates: parsed.dm_templates.map((d) => ({
        toHandle: d.to_handle,
        template: d.template,
        goal: d.goal,
      })),
      objectionPost: parsed.objection_post
        ? { post: parsed.objection_post.post, addresses: parsed.objection_post.addresses }
        : undefined,
      tomorrowPost: parsed.tomorrow_post
        ? { post: parsed.tomorrow_post.post, hook: parsed.tomorrow_post.hook }
        : undefined,
    };
  }

  // ==================== REDDIT METHODS ====================

  async fetchRedditThread(redditUrl: string): Promise<{
    post: RedditPost;
    comments: RedditComment[];
  }> {
    const prompt = buildPrompt(FETCH_REDDIT_PROMPT, {
      reddit_url: redditUrl,
    });

    const response = await this.callGrok(prompt, { webSearch: true });

    let parsed: {
      post?: {
        title: string;
        body: string;
        subreddit: string;
        author: string;
        upvotes: number;
        comment_count: number;
        url: string;
      };
      comments?: Array<{
        id: string;
        text: string;
        author: string;
        upvotes: number;
        parent_id?: string;
        depth: number;
      }>;
      error?: string;
    };

    try {
      parsed = this.parseJSON(response);
    } catch (parseError) {
      // Try to extract just the post data if comments are corrupted
      console.warn('[Grok] Reddit full parse failed, attempting partial extraction...');

      const postMatch = response.match(/"post"\s*:\s*(\{[^}]+\})/);
      if (postMatch) {
        try {
          const post = JSON.parse(postMatch[1]);
          console.log('[Grok] Extracted Reddit post, returning with empty comments');
          parsed = { post, comments: [] };
        } catch {
          throw parseError;
        }
      } else {
        throw parseError;
      }
    }

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    if (!parsed.post) {
      throw new Error('Failed to fetch Reddit post data');
    }

    const comments = parsed.comments || [];

    return {
      post: {
        title: parsed.post.title || '',
        body: parsed.post.body || '',
        subreddit: parsed.post.subreddit || '',
        author: parsed.post.author || '',
        upvotes: parsed.post.upvotes || 0,
        commentCount: parsed.post.comment_count || 0,
        url: parsed.post.url || redditUrl,
      },
      comments: comments.map((c, index) => ({
        id: c.id || `comment-${index}`,
        text: c.text || '',
        author: c.author || 'unknown',
        upvotes: c.upvotes || 0,
        parentId: c.parent_id,
        depth: c.depth || 0,
      })),
    };
  }

  async classifyRedditComments(
    post: RedditPost,
    comments: RedditComment[]
  ): Promise<{
    classifiedComments: ClassifiedRedditComment[];
    summary: AnalysisSummary;
  }> {
    // Process in batches if there are many comments
    const BATCH_SIZE = 30;
    let allClassifications: Array<{
      comment_index: number;
      author: string;
      type: string;
      intent_score: number;
      key_quote: string;
      suggested_action: string;
      reason?: string;
    }> = [];

    for (let i = 0; i < comments.length; i += BATCH_SIZE) {
      const batch = comments.slice(i, i + BATCH_SIZE);
      const batchWithIndex = batch.map((c, batchIdx) => ({
        index: i + batchIdx,
        author: c.author,
        text: c.text.substring(0, 500),
        upvotes: c.upvotes,
      }));

      const commentsJson = JSON.stringify(batchWithIndex);

      const prompt = buildPrompt(REDDIT_CLASSIFICATION_PROMPT, {
        post_title: post.title.substring(0, 300),
        post_body: post.body.substring(0, 500),
        subreddit: post.subreddit,
        comments_json: commentsJson,
        comment_count: String(batch.length),
      });

      const response = await this.callModel(prompt, {
        task: 'classification',
        maxTokens: Math.max(4000, batch.length * 200),
      });
      const parsed = this.parseJSON<{
        classifications: Array<{
          comment_index: number;
          author: string;
          type: string;
          intent_score: number;
          key_quote: string;
          suggested_action: string;
          reason?: string;
        }>;
        summary: {
          total_comments: number;
          pain_count: number;
          curiosity_count: number;
          fluff_count: number;
          objection_count: number;
          top_objection?: string;
          top_pain_point?: string;
        };
      }>(response);

      // Check if any comments were missed and fill in with defaults
      const classifiedIndices = new Set(parsed.classifications.map(c => c.comment_index));
      for (const comment of batchWithIndex) {
        if (!classifiedIndices.has(comment.index)) {
          console.warn(`[Grok] Reddit comment ${comment.index} was not classified, adding default`);
          parsed.classifications.push({
            comment_index: comment.index,
            author: comment.author,
            type: 'fluff',
            intent_score: 3,
            key_quote: comment.text.substring(0, 100),
            suggested_action: 'Ignore',
            reason: 'Auto-classified (missed by AI)',
          });
        }
      }

      allClassifications = allClassifications.concat(parsed.classifications);
    }

    // Build final summary
    const painCount = allClassifications.filter((c) => c.type === 'pain').length;
    const curiosityCount = allClassifications.filter((c) => c.type === 'curiosity').length;
    const fluffCount = allClassifications.filter((c) => c.type === 'fluff').length;
    const objectionCount = allClassifications.filter((c) => c.type === 'objection').length;

    const topPainComment = allClassifications.find((c) => c.type === 'pain');
    const topObjectionComment = allClassifications.find((c) => c.type === 'objection');

    const classifiedComments: ClassifiedRedditComment[] = allClassifications.map((c) => {
      const originalComment = comments[c.comment_index] || comments[0];
      return {
        ...originalComment,
        classification: c.type as ClassifiedRedditComment['classification'],
        intentScore: c.intent_score,
        keyQuote: c.key_quote,
        suggestedAction: c.suggested_action as ClassifiedRedditComment['suggestedAction'],
        reason: c.reason,
      };
    });

    return {
      classifiedComments,
      summary: {
        totalReplies: comments.length,
        painCount,
        curiosityCount,
        fluffCount,
        objectionCount,
        topObjection: topObjectionComment?.key_quote,
        topPainPoint: topPainComment?.key_quote,
      },
    };
  }

  async generateRedditContent(
    post: RedditPost,
    painPoints: PainPoint[],
    topObjection: string | undefined,
    goal: AnalysisGoal,
    voiceStyle?: string
  ): Promise<{
    replyDrafts: ReplyDraft[];
    followUpPost?: { title: string; body: string; bestSubreddit: string };
    contentIdeas: Array<{ idea: string; format: string; why: string }>;
  }> {
    const goalMap: Record<AnalysisGoal, string> = {
      get_replies: 'maximize engagement and discussion',
      get_clicks: 'drive traffic to a link or product (subtly)',
      pre_sell: 'build credibility for a future launch',
    };

    const prompt = buildPrompt(REDDIT_CONTENT_GENERATION_PROMPT, {
      voice_style: voiceStyle || 'helpful, knowledgeable, conversational - adds genuine value',
      post_title: post.title,
      subreddit: post.subreddit,
      goal: goalMap[goal],
      pain_points: painPoints.map((p) => p.pain).join(', ') || 'none identified',
      top_objection: topObjection || 'none identified',
    });

    const response = await this.callModel(prompt, { task: 'contentGen', temperature: 0.7 });
    const parsed = this.parseJSON<{
      reply_drafts: Array<{
        to_user: string;
        original_comment: string;
        draft: string;
        why: string;
      }>;
      dm_candidates?: Array<{ username: string; reason: string; approach: string }>;
      follow_up_post?: { title: string; body: string; best_subreddit: string };
      content_ideas: Array<{ idea: string; format: string; why: string }>;
    }>(response);

    return {
      replyDrafts: parsed.reply_drafts.map((r) => ({
        toHandle: r.to_user,
        originalReply: r.original_comment,
        draft: r.draft,
        why: r.why,
      })),
      followUpPost: parsed.follow_up_post
        ? {
            title: parsed.follow_up_post.title,
            body: parsed.follow_up_post.body,
            bestSubreddit: parsed.follow_up_post.best_subreddit,
          }
        : undefined,
      contentIdeas: parsed.content_ideas || [],
    };
  }
}

// Singleton instance
let grokClient: GrokClient | null = null;

export function getGrokClient(): GrokClient {
  if (!grokClient) {
    grokClient = new GrokClient();
  }
  return grokClient;
}

// Check if Grok is configured
export function isGrokConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
