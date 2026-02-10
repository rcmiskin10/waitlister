// Grok prompts for Reply Triage Copilot

export const CLASSIFICATION_PROMPT = `Analyze these replies to a tweet. You MUST classify EVERY reply - do not skip any.

For each reply, classify as:
- pain: expressing frustration, a specific problem, or unmet need
- curiosity: asking questions, wants to learn more, interested
- fluff: generic praise, emojis only, "this is great", low-value, or the author's own replies
- objection: doubt, pushback, skepticism, concern

Also rate intent (1-10) where 10 = highly likely to convert/engage deeply.

Tweet: {tweet_text}

Replies (you MUST return a classification for EACH of these {reply_count} replies):
{replies_json}

CRITICAL: Return exactly {reply_count} classifications - one for each reply. Do not skip any.

Respond with ONLY valid JSON, no other text:
{
  "classifications": [
    {
      "reply_index": 0,
      "author_handle": "@example",
      "type": "pain|curiosity|fluff|objection",
      "intent_score": 8,
      "key_quote": "the most important part of their reply",
      "suggested_action": "DM|Reply|Ignore|Address in post",
      "reason": "brief explanation"
    }
  ],
  "summary": {
    "total_replies": {reply_count},
    "pain_count": 3,
    "curiosity_count": 2,
    "fluff_count": 4,
    "objection_count": 1,
    "top_objection": "main concern people have",
    "top_pain_point": "main problem people mention"
  }
}`;

export const PAIN_EXTRACTION_PROMPT = `From these high-intent replies, extract actionable insights.

Replies:
{pain_replies}

Respond with ONLY valid JSON:
{
  "pain_points": [
    {
      "pain": "specific problem they mentioned",
      "frequency": "how many mentioned this",
      "urgency": "high|medium|low"
    }
  ],
  "keywords": ["words they use to describe the problem"],
  "implied_solutions": ["what they're hoping exists"],
  "dm_worthy": [
    {
      "handle": "@user",
      "reason": "why they're worth DMing",
      "intent_score": 9
    }
  ]
}`;

export const CONTENT_GENERATION_PROMPT = `Generate content for responding to these replies.

User's voice/style: {voice_style}
Original tweet: {tweet_text}
Goal: {goal}
Pain points found: {pain_points}
Top objection: {top_objection}

Generate content that is:
- Short and punchy (Twitter-native)
- Human and conversational (not corporate)
- Non-salesy (helpful, not pushy)
- Action-oriented

Respond with ONLY valid JSON:
{
  "reply_drafts": [
    {
      "to_handle": "@user",
      "original_reply": "what they said",
      "draft": "your suggested reply",
      "why": "why this reply works"
    }
  ],
  "dm_templates": [
    {
      "to_handle": "@user",
      "template": "Hey! Saw your reply about X. [personalized message]",
      "goal": "what this DM aims to achieve"
    }
  ],
  "objection_post": {
    "post": "follow-up tweet addressing the top objection",
    "addresses": "what objection this handles"
  },
  "tomorrow_post": {
    "post": "tweet idea based on what resonated",
    "hook": "why this will perform well"
  }
}`;

export const FETCH_TWEET_PROMPT = `You have access to real-time X (Twitter) data via web search. Fetch the tweet and its most valuable replies from this URL:

{tweet_url}

INSTRUCTIONS:
1. Fetch the main tweet with its text, author info, and engagement stats
2. Fetch up to 30 of the MOST VALUABLE replies using this priority:

REPLY SELECTION CRITERIA (in order of importance):
- HIGHEST PRIORITY: Replies expressing problems, frustrations, or pain ("struggling with", "hate when", "can't figure out", "the issue is", "wish there was")
- HIGH PRIORITY: Replies asking questions or seeking advice ("how do you", "what do you use", "anyone know", "looking for")
- MEDIUM PRIORITY: Replies sharing experiences or opinions (substantive text, personal stories)
- LOW PRIORITY: Simple agreement or praise with substance ("I switched to X and it helped because...")
- SKIP: Empty engagement ("💯", "this!", "facts", single emojis, very short non-substantive replies)

3. Include the tweet author's own replies if they add context
4. Use likes as a tiebreaker between replies of similar content value

Return up to 30 replies maximum, prioritized by the criteria above.

Respond with ONLY valid JSON, no markdown or extra text:
{
  "tweet": {
    "text": "the full tweet text",
    "author_handle": "username without @",
    "author_name": "display name",
    "likes": 123,
    "retweets": 45,
    "reply_count": 67
  },
  "replies": [
    {
      "id": "unique_id",
      "text": "full reply text",
      "author_handle": "username without @",
      "author_name": "display name",
      "likes": 10
    }
  ]
}

If you cannot access the tweet (deleted, private, or URL invalid), respond with:
{
  "error": "reason why the tweet couldn't be fetched"
}`;

export const FETCH_REDDIT_PROMPT = `You have access to real-time Reddit data via web search. Fetch the Reddit post and its most valuable comments from this URL:

{reddit_url}

INSTRUCTIONS:
1. Fetch the main post (title, body text, author, upvotes, comment count)
2. Fetch up to 40 of the MOST VALUABLE comments using this priority:

COMMENT SELECTION CRITERIA (in order of importance):
- HIGHEST PRIORITY: Comments expressing problems, frustrations, or needs ("struggling with", "hate when", "can't figure out", "wish there was")
- HIGH PRIORITY: Comments asking questions or seeking solutions ("how do you", "what do you use", "anyone recommend")
- MEDIUM PRIORITY: Comments sharing detailed experiences, recommendations with reasoning, or debates
- LOW PRIORITY: Simple agreement with some substance
- SKIP: Low-effort comments ("this", "lol", "same", single words, deleted comments)

3. Include nested replies if they contain valuable discussion
4. Use upvotes as a tiebreaker between comments of similar content value

Return up to 40 comments maximum, prioritized by the criteria above.
6. Include the comment's upvote count and author username

Return the original post and ALL comments you can find.

Respond with ONLY valid JSON, no other text:
{
  "post": {
    "title": "the post title",
    "body": "the post body text (empty string if link/image post)",
    "subreddit": "subreddit name without r/",
    "author": "username without u/",
    "upvotes": 123,
    "comment_count": 45,
    "url": "the original URL"
  },
  "comments": [
    {
      "id": "unique_id",
      "text": "comment text",
      "author": "username without u/",
      "upvotes": 10,
      "parent_id": "parent comment id or null if top-level",
      "depth": 0
    }
  ]
}

If you cannot access the post (deleted, private, or URL invalid), respond with:
{
  "error": "reason why the post couldn't be fetched"
}`;

export const REDDIT_CLASSIFICATION_PROMPT = `Analyze these comments on a Reddit post. You MUST classify EVERY comment - do not skip any.

For each comment, classify as:
- pain: expressing frustration, a specific problem, or unmet need
- curiosity: asking questions, wants to learn more, interested
- fluff: generic praise, jokes, memes, low-value, off-topic
- objection: doubt, pushback, skepticism, concern, criticism

Also rate intent (1-10) where 10 = highly engaged, potential customer/user.

Post Title: {post_title}
Post Body: {post_body}
Subreddit: r/{subreddit}

Comments (you MUST return a classification for EACH of these {comment_count} comments):
{comments_json}

CRITICAL: Return exactly {comment_count} classifications - one for each comment. Do not skip any.

Respond with ONLY valid JSON, no other text:
{
  "classifications": [
    {
      "comment_index": 0,
      "author": "username",
      "type": "pain|curiosity|fluff|objection",
      "intent_score": 8,
      "key_quote": "the most important part of their comment",
      "suggested_action": "Reply|DM|Ignore|Address in post",
      "reason": "brief explanation"
    }
  ],
  "summary": {
    "total_comments": {comment_count},
    "pain_count": 3,
    "curiosity_count": 2,
    "fluff_count": 4,
    "objection_count": 1,
    "top_objection": "main concern people have",
    "top_pain_point": "main problem people mention"
  }
}`;

export const REDDIT_CONTENT_GENERATION_PROMPT = `Generate content for responding to these Reddit comments.

User's voice/style: {voice_style}
Original post title: {post_title}
Subreddit: r/{subreddit}
Goal: {goal}
Pain points found: {pain_points}
Top objection: {top_objection}

Generate content that is:
- Helpful and adds value (Reddit hates self-promotion)
- Conversational and authentic
- NOT salesy or promotional
- Follows subreddit culture/norms

Respond with ONLY valid JSON:
{
  "reply_drafts": [
    {
      "to_user": "username",
      "original_comment": "what they said",
      "draft": "your suggested reply",
      "why": "why this reply works"
    }
  ],
  "dm_candidates": [
    {
      "username": "user",
      "reason": "why they're worth reaching out to",
      "approach": "suggested DM approach"
    }
  ],
  "follow_up_post": {
    "title": "suggested follow-up post title",
    "body": "post body that addresses common questions/concerns",
    "best_subreddit": "where to post this"
  },
  "content_ideas": [
    {
      "idea": "content idea based on what resonated",
      "format": "post|comment|guide|video",
      "why": "why this will perform well"
    }
  ]
}`;

// Helper to build prompts with variables
export function buildPrompt(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
