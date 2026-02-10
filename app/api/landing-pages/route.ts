import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { LandingPageStructure } from '@/types/agents'

// GET /api/landing-pages - Get user's landing pages or published page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published') === 'true'

    // Dev mode - return empty or mock
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ pages: [] })
    }

    const supabase = await createClient()

    // If requesting published page, don't require auth
    if (published) {
      const { data: page, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !page) {
        return NextResponse.json({ page: null })
      }

      return NextResponse.json({ page })
    }

    // Otherwise, require auth and return user's pages
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: pages, error } = await supabase
      .from('landing_pages')
      .select('id, name, slug, is_published, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch landing pages:', error)
      return NextResponse.json({ error: 'Failed to fetch landing pages' }, { status: 500 })
    }

    return NextResponse.json({ pages: pages || [] })
  } catch (error) {
    console.error('Landing pages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/landing-pages - Create a new landing page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, content, theme, metadata } = body as {
      name: string
      content: LandingPageStructure
      theme?: LandingPageStructure['theme']
      metadata?: LandingPageStructure['metadata']
    }

    if (!name || !content) {
      return NextResponse.json({ error: 'Missing name or content' }, { status: 400 })
    }

    // Dev mode - return mock page
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        page: {
          id: `dev-${Date.now()}`,
          name,
          content,
          theme: theme || content.theme,
          metadata: metadata || content.metadata,
          is_published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: page, error } = await (supabase
      .from('landing_pages') as any)
      .insert({
        user_id: user.id,
        name,
        slug: `${slug}-${Date.now()}`,
        content,
        theme: theme || content.theme,
        metadata: metadata || content.metadata,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create landing page:', error)
      return NextResponse.json({ error: 'Failed to create landing page' }, { status: 500 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Landing pages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
