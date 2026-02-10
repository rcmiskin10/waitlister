/**
 * Rate limiter for X API requests
 * Tracks rate limits from response headers:
 * - x-rate-limit-limit: Max requests allowed
 * - x-rate-limit-remaining: Requests remaining in window
 * - x-rate-limit-reset: Unix timestamp when window resets
 */

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetsAt?: Date;
  usedThisMonth?: number;
  monthlyBudget?: number;
}

class XApiRateLimiter {
  private limit: number = 15; // X API Basic plan: 15 requests per 15 minutes
  private remaining: number = 15;
  private resetsAt: Date | null = null;

  // Monthly budget tracking (X API Basic: 15k reads/month)
  private monthlyBudget: number = 15000;
  private usedThisMonth: number = 0;
  private monthStarted: Date = new Date();

  constructor() {
    // Reset monthly counter at start of each month
    this.resetMonthlyIfNeeded();
  }

  private resetMonthlyIfNeeded(): void {
    const now = new Date();
    if (
      now.getMonth() !== this.monthStarted.getMonth() ||
      now.getFullYear() !== this.monthStarted.getFullYear()
    ) {
      this.usedThisMonth = 0;
      this.monthStarted = now;
    }
  }

  /**
   * Track rate limit from response headers
   */
  trackRequest(headers: Headers): void {
    const limitHeader = headers.get('x-rate-limit-limit');
    const remainingHeader = headers.get('x-rate-limit-remaining');
    const resetHeader = headers.get('x-rate-limit-reset');

    if (limitHeader) {
      this.limit = parseInt(limitHeader, 10);
    }

    if (remainingHeader) {
      this.remaining = parseInt(remainingHeader, 10);
    }

    if (resetHeader) {
      // X API returns Unix timestamp in seconds
      this.resetsAt = new Date(parseInt(resetHeader, 10) * 1000);
    }

    // Increment monthly usage
    this.resetMonthlyIfNeeded();
    this.usedThisMonth++;
  }

  /**
   * Check if we can make a request
   */
  canMakeRequest(): boolean {
    // If we have remaining requests in the window, allow
    if (this.remaining > 0) {
      return true;
    }

    // If the reset time has passed, reset and allow
    if (this.resetsAt && new Date() >= this.resetsAt) {
      this.remaining = this.limit;
      this.resetsAt = null;
      return true;
    }

    return false;
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitStatus {
    this.resetMonthlyIfNeeded();
    return {
      limit: this.limit,
      remaining: this.remaining,
      resetsAt: this.resetsAt || undefined,
      usedThisMonth: this.usedThisMonth,
      monthlyBudget: this.monthlyBudget,
    };
  }

  /**
   * Manually decrement remaining (for optimistic tracking)
   */
  decrementRemaining(): void {
    if (this.remaining > 0) {
      this.remaining--;
    }
  }

  /**
   * Get estimated reads remaining this month
   */
  getMonthlyRemaining(): number {
    this.resetMonthlyIfNeeded();
    return this.monthlyBudget - this.usedThisMonth;
  }

  /**
   * Check if we have budget for a finder run (~1300 reads)
   */
  hasFinderBudget(): boolean {
    return this.getMonthlyRemaining() >= 1300;
  }

  /**
   * Add to monthly usage (for batch operations)
   */
  addMonthlyUsage(reads: number): void {
    this.resetMonthlyIfNeeded();
    this.usedThisMonth += reads;
  }

  /**
   * Wait until rate limit resets
   */
  async waitForReset(): Promise<void> {
    if (!this.resetsAt) return;

    const now = new Date();
    const waitMs = this.resetsAt.getTime() - now.getTime();

    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs + 1000)); // Add 1s buffer
    }

    this.remaining = this.limit;
    this.resetsAt = null;
  }
}

// Singleton instance
let rateLimiter: XApiRateLimiter | null = null;

export function getRateLimiter(): XApiRateLimiter {
  if (!rateLimiter) {
    rateLimiter = new XApiRateLimiter();
  }
  return rateLimiter;
}

/**
 * Format rate limit status for display
 */
export function formatRateLimitStatus(status: RateLimitStatus): string {
  const parts: string[] = [];

  parts.push(`${status.remaining}/${status.limit} requests remaining`);

  if (status.resetsAt) {
    const now = new Date();
    const secondsUntilReset = Math.max(
      0,
      Math.ceil((status.resetsAt.getTime() - now.getTime()) / 1000)
    );
    parts.push(`resets in ${secondsUntilReset}s`);
  }

  if (status.usedThisMonth !== undefined && status.monthlyBudget !== undefined) {
    const monthlyRemaining = status.monthlyBudget - status.usedThisMonth;
    parts.push(`${monthlyRemaining.toLocaleString()} monthly reads remaining`);
  }

  return parts.join(' | ');
}
