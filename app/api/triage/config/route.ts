import { NextResponse } from 'next/server';
import { isGrokConfigured } from '@/lib/grok/client';
import { isXApiConfigured } from '@/lib/x-api/client';

export async function GET() {
  const grokConfigured = isGrokConfigured();
  const xApiConfigured = isXApiConfigured();

  return NextResponse.json({
    configured: grokConfigured,
    canFetchUrl: xApiConfigured || grokConfigured,
    useXApi: xApiConfigured,
  });
}
