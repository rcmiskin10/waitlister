import type { SearchTweet } from '@/lib/x-api/search';
import type { RateLimitStatus } from '@/lib/x-api/rate-limiter';

/**
 * Pain signal data for a thread
 */
export interface PainSignal {
  density: number; // 0-1 (pain replies / sampled replies)
  painCount: number; // absolute count of pain replies
  sampleSize: number; // how many replies we scanned
  topPainQuote: string; // best pain quote for display
  matchedKeywords: string[]; // why this thread was surfaced
}

/**
 * A thread candidate during scanning
 */
export interface ThreadCandidate {
  id: string;
  text: string;
  authorUsername: string;
  authorName: string;
  authorProfileImage?: string;
  conversationId: string;
  createdAt: string;
  metrics: {
    replyCount: number;
    likeCount: number;
    retweetCount: number;
  };
  // Added during Stage 1 scan
  stage1PainSignal?: {
    painCount: number;
    sampleSize: number;
    density: number;
  };
}

/**
 * Classified reply sample
 */
export interface ClassifiedSample {
  id: string;
  text: string;
  authorUsername: string;
  isPain: boolean;
  classification: 'pain' | 'curiosity' | 'objection' | 'fluff';
  keyQuote?: string;
}

/**
 * A scored thread ready for display
 */
export interface ScoredThread {
  id: string;
  url: string;
  text: string;
  author: {
    username: string;
    name: string;
    profileImage?: string;
  };
  metrics: {
    replies: number;
    likes: number;
    retweets: number;
  };
  painSignal: PainSignal;
  score: number; // 0-100 (pain-weighted)
  whySurfaced: string; // human-readable explanation
  createdAt: string;
}

/**
 * Preset audience targeting
 */
export type AudiencePreset =
  | 'indie-hackers'
  | 'build-in-public'
  | 'solo-founders'
  | 'saas-founders'
  | 'no-code'
  | 'custom';

/**
 * Audience configuration for focused searching
 */
export interface AudienceConfig {
  preset: AudiencePreset;
  // Key accounts/influencers in this niche to look at replies to
  keyAccounts: string[];
  // Hashtags commonly used
  hashtags: string[];
  // Community IDs (if known)
  communityIds?: string[];
  // Full community URLs for Grok to reference
  communityUrls?: string[];
  // Keywords that identify this audience
  identifyingKeywords: string[];
}

/**
 * Built-in audience presets with real influencers and community URLs
 */
export const AUDIENCE_PRESETS: Record<Exclude<AudiencePreset, 'custom'>, AudienceConfig> = {
  'indie-hackers': {
    preset: 'indie-hackers',
    // These are reference accounts - we search for posts from people who engage with them, not just from them
    keyAccounts: [
      'levelsio',      // Pieter Levels - PhotoAI, NomadList
      'marckohlbrugge', // Marc Köhlbrugge - WIP, BetaList
      'marclou',       // Marc Lou - ShipFast
      'tibo_maker',    // Tibo - TweetHunter, Taplio
      'thekitze',      // Kitze - Sizzy
      'DanKulkov',     // Dan Kulkov - Makerbox
      'dannypostmaa',  // Danny Postma - HeadshotPro
    ],
    hashtags: ['#indiehackers', '#buildinpublic', '#microSaaS', '#indiedev', '#shipfast', '#solofounder'],
    communityIds: ['1493446837214187523', '1824090181827457380', '1471580197908586507'],
    communityUrls: [
      'https://x.com/i/communities/1493446837214187523', // Build in Public
      'https://x.com/i/communities/1824090181827457380', // Startup Founders
      'https://x.com/i/communities/1471580197908586507', // Indie Hackers
    ],
    identifyingKeywords: ['indie hacker', 'side project', 'solo founder', 'bootstrapped', 'MRR', 'ARR', 'launched on Product Hunt', 'shipped', 'ramen profitable', 'building in public'],
  },
  'build-in-public': {
    preset: 'build-in-public',
    keyAccounts: [
      'levelsio',
      'marckohlbrugge',
      'marclou',
      'tibo_maker',
      'thisiskp_',
      'jdnoc',
      'tdinh_me',
      'damaboronnikov',
    ],
    hashtags: ['#buildinpublic', '#buildingpublicly', '#openstartupdiary', '#indiehackers'],
    communityIds: ['1493446837214187523', '1824090181827457380'],
    communityUrls: [
      'https://x.com/i/communities/1493446837214187523', // Build in Public
      'https://x.com/i/communities/1824090181827457380', // Startup founders
    ],
    identifyingKeywords: ['build in public', 'building publicly', 'sharing my journey', 'revenue update', 'monthly update', 'week 1', 'day 1'],
  },
  'solo-founders': {
    preset: 'solo-founders',
    keyAccounts: [
      'levelsio',
      'marckohlbrugge',
      'marclou',
      'tibo_maker',
      'DanKulkov',
      'haboronnikov',
    ],
    hashtags: ['#solofounder', '#bootstrapped', '#indiehacker', '#buildinpublic'],
    communityIds: ['1493446837214187523', '1471580197908586507'],
    communityUrls: [
      'https://x.com/i/communities/1493446837214187523',
      'https://x.com/i/communities/1471580197908586507',
    ],
    identifyingKeywords: ['solo founder', 'solopreneur', 'one-person business', 'bootstrapped', 'no VC', 'self-funded'],
  },
  'saas-founders': {
    preset: 'saas-founders',
    keyAccounts: [
      'robhope',       // Rob Hope - One Page Love
      'ajlkn',         // AJ - Carrd
      'PatWalls',      // Pat Walls - Starter Story
      'araboronnikov',
      'levelsio',
    ],
    hashtags: ['#SaaS', '#B2BSaaS', '#microSaaS', '#buildinpublic'],
    communityIds: [],
    communityUrls: [],
    identifyingKeywords: ['SaaS', 'subscription', 'churn', 'MRR', 'ARR', 'customer acquisition', 'B2B', 'monthly recurring'],
  },
  'no-code': {
    preset: 'no-code',
    keyAccounts: [
      'bentossell',    // Ben Tossell - Makerpad
      'nocodedevs',
      'lachlangn',     // Lachlan - No Code MVP
    ],
    hashtags: ['#nocode', '#lowcode', '#bubble', '#webflow', '#nocodemvp'],
    communityIds: [],
    communityUrls: [],
    identifyingKeywords: ['no-code', 'low-code', 'Bubble', 'Webflow', 'Zapier', 'Make', 'without coding', 'visual builder'],
  },
};

/**
 * Input for thread finder
 */
export interface FinderInput {
  topic: string; // "indie hackers struggling with landing pages"
  language?: string; // "en"
  minReplies?: number; // default 3
  audience?: AudiencePreset; // Target audience preset
  customAudience?: Partial<AudienceConfig>; // Custom audience config
}

/**
 * Generated search queries from AI
 */
export interface GeneratedQueries {
  queries: string[]; // 3-5 search queries
  painKeywords: string[]; // 5-10 keywords to look for
}

/**
 * Stage 1 scan result for a single thread
 */
export interface Stage1Result {
  candidate: ThreadCandidate;
  samples: ClassifiedSample[];
  painDensity: number;
}

/**
 * Stage 2 deep scan result
 */
export interface Stage2Result {
  candidate: ThreadCandidate;
  samples: ClassifiedSample[];
  painSignal: PainSignal;
  matchedKeywords: string[];
}

/**
 * Final finder result
 */
export interface FinderResult {
  success: boolean;
  threads: ScoredThread[];
  queryUsed: string[];
  topicKeywords: string[];
  painKeywords: string[];
  stats: {
    candidatesFetched: number;
    stage1Scanned: number;
    stage2Scanned: number;
    totalApiReads: number;
  };
  rateLimitStatus: RateLimitStatus;
  error?: string;
}

/**
 * Progress callback for finder operations
 */
export type FinderProgressCallback = (progress: {
  stage: 'generating_queries' | 'fetching_candidates' | 'stage1_scan' | 'stage2_scan' | 'scoring';
  current: number;
  total: number;
  message: string;
}) => void;
