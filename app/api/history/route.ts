import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDiscoveryHistory, getAnalysisHistory } from '@/lib/triage/db';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const response: {
      success: boolean;
      discoveries?: Awaited<ReturnType<typeof getDiscoveryHistory>>;
      analyses?: Awaited<ReturnType<typeof getAnalysisHistory>>;
    } = { success: true };

    if (type === 'all' || type === 'discoveries') {
      response.discoveries = await getDiscoveryHistory(user.id, limit);
    }

    if (type === 'all' || type === 'analyses') {
      response.analyses = await getAnalysisHistory(user.id, limit);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[history] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
