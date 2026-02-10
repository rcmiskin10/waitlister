import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/landing-pages/[id] - Get a specific landing page
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: page, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !page) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/landing-pages/[id] - Update a landing page (including publish)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, content, theme, metadata, is_published } = body

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        page: { id, ...body, updated_at: new Date().toISOString() }
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (content !== undefined) updateData.content = content
    if (theme !== undefined) updateData.theme = theme
    if (metadata !== undefined) updateData.metadata = metadata
    if (is_published !== undefined) {
      updateData.is_published = is_published

      // If publishing, unpublish other pages first
      if (is_published) {
        await (supabase
          .from('landing_pages') as any)
          .update({ is_published: false })
          .eq('user_id', user.id)
          .neq('id', id)
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: page, error } = await (supabase
      .from('landing_pages') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update landing page:', error)
      return NextResponse.json({ error: 'Failed to update landing page' }, { status: 500 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/landing-pages/[id] - Delete a landing page
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete landing page:', error)
      return NextResponse.json({ error: 'Failed to delete landing page' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
