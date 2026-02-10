import type { ThreadCandidate, PainSignal, ScoredThread, ClassifiedSample } from './types';

/**
 * Scoring weights
 * Pain density is the PRIMARY signal (0.7)
 * Other signals are only tiebreakers
 */
const WEIGHTS = {
  painDensity: 0.7,
  keywordRelevance: 0.2,
  engagementSignal: 0.1,
};

/**
 * Calculate pain density from samples
 */
export function calculatePainDensity(samples: ClassifiedSample[]): number {
  if (samples.length === 0) return 0;
  const painCount = samples.filter((s) => s.isPain).length;
  return painCount / samples.length;
}

/**
 * Calculate keyword relevance score
 * How many of the target keywords appear in the thread
 */
export function calculateKeywordRelevance(
  text: string,
  samples: ClassifiedSample[],
  painKeywords: string[]
): { score: number; matchedKeywords: string[] } {
  if (painKeywords.length === 0) return { score: 0, matchedKeywords: [] };

  // Combine thread text with pain sample texts
  const allText = [
    text.toLowerCase(),
    ...samples.filter((s) => s.isPain).map((s) => s.text.toLowerCase()),
  ].join(' ');

  const matchedKeywords = painKeywords.filter((keyword) =>
    allText.includes(keyword.toLowerCase())
  );

  return {
    score: matchedKeywords.length / painKeywords.length,
    matchedKeywords,
  };
}

/**
 * Calculate engagement signal (normalized log of reply count)
 * This is ONLY a tiebreaker, not a primary signal
 */
export function calculateEngagementSignal(replyCount: number): number {
  // Use log scale to prevent high-reply threads from dominating
  // Normalize so that 100 replies = ~0.5, 1000 replies = ~0.75
  if (replyCount <= 0) return 0;
  const logReplies = Math.log10(replyCount + 1);
  return Math.min(1, logReplies / 4); // 10000 replies = 1.0
}

/**
 * Extract the best pain quote from samples
 */
export function extractTopPainQuote(samples: ClassifiedSample[]): string {
  const painSamples = samples.filter((s) => s.isPain && s.keyQuote);

  if (painSamples.length === 0) {
    // Fall back to any pain sample text
    const firstPain = samples.find((s) => s.isPain);
    if (firstPain) {
      return truncateQuote(firstPain.text, 150);
    }
    return '';
  }

  // Return the first key quote (ideally sorted by quality)
  return painSamples[0].keyQuote || truncateQuote(painSamples[0].text, 150);
}

/**
 * Truncate a quote to max length, preserving word boundaries
 */
function truncateQuote(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Generate human-readable "why surfaced" explanation
 */
export function generateWhySurfaced(
  painDensity: number,
  matchedKeywords: string[],
  sampleSize: number
): string {
  const parts: string[] = [];

  // Pain density description
  const painPercent = Math.round(painDensity * 100);
  if (painPercent >= 70) {
    parts.push(`Very high pain density (${painPercent}%)`);
  } else if (painPercent >= 50) {
    parts.push(`High pain density (${painPercent}%)`);
  } else if (painPercent >= 30) {
    parts.push(`Moderate pain density (${painPercent}%)`);
  } else {
    parts.push(`${painPercent}% pain signals`);
  }

  // Keywords
  if (matchedKeywords.length > 0) {
    const keywordList = matchedKeywords.slice(0, 3).join(', ');
    parts.push(`Matches: ${keywordList}`);
  }

  return parts.join(' | ');
}

/**
 * Build pain signal object from samples
 */
export function buildPainSignal(
  samples: ClassifiedSample[],
  painKeywords: string[],
  threadText: string
): PainSignal {
  const painCount = samples.filter((s) => s.isPain).length;
  const density = samples.length > 0 ? painCount / samples.length : 0;
  const topPainQuote = extractTopPainQuote(samples);
  const { matchedKeywords } = calculateKeywordRelevance(threadText, samples, painKeywords);

  return {
    density,
    painCount,
    sampleSize: samples.length,
    topPainQuote,
    matchedKeywords,
  };
}

/**
 * Calculate final thread score (0-100)
 * Pain density is the PRIMARY signal
 */
export function calculateThreadScore(
  painDensity: number,
  keywordRelevance: number,
  engagementSignal: number
): number {
  const rawScore =
    painDensity * WEIGHTS.painDensity +
    keywordRelevance * WEIGHTS.keywordRelevance +
    engagementSignal * WEIGHTS.engagementSignal;

  return Math.round(rawScore * 100);
}

/**
 * Score and rank threads
 */
export function scoreAndRankThreads(
  candidates: Array<{
    candidate: ThreadCandidate;
    samples: ClassifiedSample[];
  }>,
  painKeywords: string[]
): ScoredThread[] {
  const scored = candidates.map(({ candidate, samples }) => {
    const painDensity = calculatePainDensity(samples);
    const { score: keywordScore, matchedKeywords } = calculateKeywordRelevance(
      candidate.text,
      samples,
      painKeywords
    );
    const engagementSignal = calculateEngagementSignal(candidate.metrics.replyCount);

    const score = calculateThreadScore(painDensity, keywordScore, engagementSignal);
    const painSignal = buildPainSignal(samples, painKeywords, candidate.text);
    const whySurfaced = generateWhySurfaced(painDensity, matchedKeywords, samples.length);

    return {
      id: candidate.id,
      url: `https://x.com/i/status/${candidate.id}`,
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
      painSignal,
      score,
      whySurfaced,
      createdAt: candidate.createdAt,
    } satisfies ScoredThread;
  });

  // Sort by score (pain density weighted) descending
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Get pain density badge text
 */
export function getPainDensityBadge(density: number): {
  label: string;
  level: 'high' | 'medium' | 'low' | 'none';
} {
  const percent = Math.round(density * 100);

  if (percent >= 70) {
    return { label: `${percent}% Pain`, level: 'high' };
  } else if (percent >= 50) {
    return { label: `${percent}% Pain`, level: 'medium' };
  } else if (percent >= 20) {
    return { label: `${percent}% Pain`, level: 'low' };
  } else {
    return { label: `${percent}% Pain`, level: 'none' };
  }
}
