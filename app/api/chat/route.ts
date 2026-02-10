import { NextRequest } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { AgentOrchestrator } from '@/lib/agents/orchestrator'
import type { AgentType, ChatRequest } from '@/types/agents'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    // Check auth only if Supabase is configured
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment variables. Get a key at console.anthropic.com'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const body = await req.json()
    const { agentType, prompt, messages, sessionId, pageId, context } = body as ChatRequest

    // Need either prompt or messages
    if (!agentType || (!prompt && (!messages || messages.length === 0))) {
      return new Response(JSON.stringify({ error: 'Missing agentType or prompt/messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate agent type
    const validAgents: AgentType[] = [
      'landing-generator',
      'metrics-analyst',
      'market-researcher',
      'social-listener',
    ]
    if (!validAgents.includes(agentType)) {
      return new Response(JSON.stringify({ error: 'Invalid agent type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('[Chat API] Request:', { agentType, promptLength: prompt?.length, messagesCount: messages?.length, hasContext: !!context })

    const orchestrator = new AgentOrchestrator()
    const result = await orchestrator.runAgent({
      agentType,
      prompt: prompt || '',
      messages,
      sessionId,
      pageId,
      context,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
