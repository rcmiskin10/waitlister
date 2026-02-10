// Types for Reply Triage Copilot

export type ReplyClassification = 'pain' | 'curiosity' | 'feature_request' | 'fluff' | 'objection';
export type SuggestedAction = 'DM' | 'Reply' | 'Ignore' | 'Address in post';
export type AnalysisGoal = 'get_replies' | 'get_clicks' | 'pre_sell';

// Display labels for founder-friendly UI
export const CLASSIFICATION_LABELS: Record<ReplyClassification, string> = {
  pain: 'Lived Pain',
  curiosity: 'Interest',
  feature_request: 'Feature Request',
  fluff: 'Polite Noise',
  objection: 'Resistance',
};

// Descriptions for tooltips/help text
export const CLASSIFICATION_DESCRIPTIONS: Record<ReplyClassification, string> = {
  pain: 'Someone expressing a real problem they have experienced',
  curiosity: 'Genuine curiosity, questions, wanting to learn more',
  feature_request: 'Suggesting improvements or new capabilities',
  fluff: 'Generic praise, low-signal engagement',
  objection: 'Doubt, skepticism, concerns to address',
};

// Action label mapping
export const ACTION_LABELS: Record<SuggestedAction, string> = {
  DM: 'Send a DM',
  Reply: 'Reply publicly',
  Ignore: 'Skip for now',
  'Address in post': 'Address in follow-up post',
};

// Helper to convert intentScore (1-10) to pullScore (0-100)
export function toPullScore(intentScore: number): number {
  return Math.round(intentScore * 10);
}

export interface TweetMedia {
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  previewUrl?: string;
  width?: number;
  height?: number;
}

export interface Reply {
  id: string;
  text: string;
  authorHandle: string;
  authorName?: string;
  authorProfileImage?: string;
  authorFollowers?: number;
  createdAt?: string;
  likes?: number;
  retweets?: number;
  views?: number; // impression_count from X API
  replyCount?: number;
  parentTweetId?: string; // ID of tweet this is replying to (for nested replies)
  media?: TweetMedia[]; // Attached images/videos
}

export interface ClassifiedReply extends Reply {
  classification: ReplyClassification;
  intentScore: number;
  keyQuote: string;
  suggestedAction: SuggestedAction;
  reason?: string;
  isSpam?: boolean;
  isBot?: boolean;
}

export interface AnalysisSummary {
  totalReplies: number;
  painCount: number;
  curiosityCount: number;
  featureRequestCount?: number;
  fluffCount: number;
  objectionCount: number;
  topObjection?: string;
  topPainPoint?: string;
}

export interface PainPoint {
  pain: string;
  frequency: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface DMCandidate {
  handle: string;
  reason: string;
  intentScore: number;
  originalReply?: string;
}

export interface ReplyDraft {
  toHandle: string;
  originalReply: string;
  draft: string;
  why: string;
}

export interface DMTemplate {
  toHandle: string;
  template: string;
  goal: string;
}

export interface GeneratedPost {
  post: string;
  addresses?: string;
  hook?: string;
}

export interface TweetMetadata {
  likes?: number;
  retweets?: number;
  replyCount?: number;
  authorName?: string;
  authorProfileImage?: string;
}

export interface TriageAnalysis {
  // Input
  tweetUrl: string;
  tweetText: string;
  tweetAuthor: string;
  tweetMetadata?: TweetMetadata;
  goal: AnalysisGoal;

  // Classification results
  classifiedReplies: ClassifiedReply[];
  summary: AnalysisSummary;

  // Pain extraction
  painPoints: PainPoint[];
  keywords: string[];
  impliedSolutions: string[];
  dmCandidates: DMCandidate[];

  // Generated content
  replyDrafts: ReplyDraft[];
  dmTemplates: DMTemplate[];
  objectionPost?: GeneratedPost;
  tomorrowPost?: GeneratedPost;

  // Metadata
  createdAt: string;
  id: string;
}

export interface TriageRequest {
  tweetUrl?: string;
  tweetText: string;
  replies: Reply[];
  goal: AnalysisGoal;
  voiceStyle?: string;
}

export interface TriageResponse {
  success: boolean;
  analysis?: TriageAnalysis;
  error?: string;
}

// Reddit types
export interface RedditPost {
  title: string;
  body: string;
  subreddit: string;
  author: string;
  upvotes: number;
  commentCount: number;
  url: string;
}

export interface RedditComment {
  id: string;
  text: string;
  author: string;
  upvotes: number;
  parentId?: string;
  depth: number;
}

export interface ClassifiedRedditComment extends RedditComment {
  classification: ReplyClassification;
  intentScore: number;
  keyQuote: string;
  suggestedAction: SuggestedAction;
  reason?: string;
}

export interface RedditContentIdea {
  idea: string;
  format: 'post' | 'comment' | 'guide' | 'video';
  why: string;
}

export interface RedditFollowUpPost {
  title: string;
  body: string;
  bestSubreddit: string;
}

export interface RedditAnalysis {
  // Source
  source: 'reddit';
  url: string;
  post: RedditPost;
  goal: AnalysisGoal;

  // Classification results
  classifiedComments: ClassifiedRedditComment[];
  summary: AnalysisSummary;

  // Pain extraction
  painPoints: PainPoint[];
  keywords: string[];
  impliedSolutions: string[];
  dmCandidates: DMCandidate[];

  // Generated content
  replyDrafts: ReplyDraft[];
  followUpPost?: RedditFollowUpPost;
  contentIdeas: RedditContentIdea[];

  // Metadata
  createdAt: string;
  id: string;
}

// XThreadFinder/Triage enhanced types

export type OpportunityType = 'validate_idea' | 'find_customers' | 'learn_language' | 'skip';
export type PainIntensity = 'high' | 'medium' | 'low' | 'none';
export type NextActionType = 'reply' | 'dm' | 'post' | 'skip';

export interface ThreadVerdict {
  worthEngaging: boolean;
  painIntensity: PainIntensity;
  opportunityType: OpportunityType;
  oneLiner: string; // e.g., "7 people frustrated with X, 3 worth DMing"
}

export interface NextAction {
  action: NextActionType;
  target?: string; // handle or description
  reason: string;
  draft?: string;
}
