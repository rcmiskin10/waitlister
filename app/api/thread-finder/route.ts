import { NextRequest, NextResponse } from 'next/server';
import { findThreadsWithPain } from '@/lib/thread-finder';
import { createClient } from '@/lib/supabase/server';
import { saveDiscovery } from '@/lib/triage/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { topic, language, minReplies, audience } = body as {
      topic?: string;
      language?: string;
      minReplies?: number;
      audience?: 'indie-hackers' | 'build-in-public' | 'solo-founders' | 'saas-founders' | 'no-code';
    };

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (topic.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Topic must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Find threads with pain
    const result = await findThreadsWithPain({
      topic: topic.trim(),
      language: language || 'en',
      minReplies: minReplies ?? 2,
      audience: audience,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Save discovery to database (async, don't block response)
    if (result.threads.length > 0) {
      saveDiscovery(
        user.id,
        topic.trim(),
        audience,
        language || 'en',
        result.painKeywords,
        result.threads
      ).catch((err) => console.error('[thread-finder] Failed to save discovery:', err));
    }

    return NextResponse.json({
      success: true,
      threads: result.threads,
      queryUsed: result.queryUsed,
      topicKeywords: result.topicKeywords,
      painKeywords: result.painKeywords,
      stats: result.stats,
      rateLimitStatus: {
        remaining: result.rateLimitStatus.remaining,
        limit: result.rateLimitStatus.limit,
        resetsAt: result.rateLimitStatus.resetsAt?.toISOString(),
        monthlyRemaining:
          (result.rateLimitStatus.monthlyBudget || 15000) -
          (result.rateLimitStatus.usedThisMonth || 0),
      },
    });
  } catch (error) {
    console.error('[thread-finder] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
