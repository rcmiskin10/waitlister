import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { AgentSession } from '@/types/database.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/sessions/[id] - Get a specific session
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Dev mode - return mock session
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        session: {
          id,
          agent_type: 'landing-generator',
          title: 'Dev Session',
          messages: [],
          context: {},
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

    const { data: session, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sessions/[id] - Update a session (messages, title, context)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const { messages, title, context } = body

    // Dev mode - return success
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        session: {
          id,
          ...body,
          updated_at: new Date().toISOString(),
        }
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (messages !== undefined) updateData.messages = messages
    if (title !== undefined) updateData.title = title
    if (context !== undefined) updateData.context = context

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error } = await (supabase
      .from('agent_sessions') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single() as { data: AgentSession | null; error: Error | null }

    if (error) {
      console.error('Failed to update session:', error)
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Dev mode - return success
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('agent_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete session:', error)
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
