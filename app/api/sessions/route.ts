import { NextRequest, NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { AgentType } from '@/types/agents'
import type { AgentSession } from '@/types/database.types'

// GET /api/sessions - List sessions for an agent type
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentType = searchParams.get('agentType') as AgentType

    if (!agentType) {
      return NextResponse.json({ error: 'Missing agentType' }, { status: 400 })
    }

    // Dev mode - return empty array
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ sessions: [] })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sessions, error } = await supabase
      .from('agent_sessions')
      .select('id, title, agent_type, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('agent_type', agentType)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sessions - Create a new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentType, title, messages = [], context = {} } = body

    if (!agentType) {
      return NextResponse.json({ error: 'Missing agentType' }, { status: 400 })
    }

    // Dev mode - return mock session
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        session: {
          id: `dev-${Date.now()}`,
          agent_type: agentType,
          title: title || 'New Chat',
          messages,
          context,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error } = await (supabase
      .from('agent_sessions') as any)
      .insert({
        user_id: user.id,
        agent_type: agentType,
        title: title || 'New Chat',
        messages,
        context,
      })
      .select()
      .single() as { data: AgentSession | null; error: Error | null }

    if (error) {
      console.error('Failed to create session:', error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
