import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { getAgentConfig } from './config'
import type { AgentType, ChatRequest, ConversationContext } from '@/types/agents'

// Initialize Anthropic client
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Map agent model preferences to Claude models
const MODEL_MAP = {
  sonnet: 'claude-sonnet-4-5-20250929',
  opus: 'claude-opus-4-6',
  haiku: 'claude-haiku-4-5-20251001',
} as const

export class AgentOrchestrator {
  async runAgent(request: ChatRequest) {
    const { agentType, prompt, messages, context } = request
    const config = getAgentConfig(agentType)
    const modelId = MODEL_MAP[config.model]

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(config.systemPrompt, context)

    // Build messages array - either from history or single prompt
    const chatMessages = this.buildMessages(prompt, messages, context)

    const result = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      maxOutputTokens: config.maxTokens,
      messages: chatMessages,
    })

    return result
  }

  /**
   * Build system prompt with injected context about current page.
   */
  private buildSystemPrompt(
    basePrompt: string,
    context?: ConversationContext
  ): string {
    if (!context?.currentPage) return basePrompt

    const pageContext = `
## Current Page Context

The user has an existing landing page that they may want to modify. Here is the current structure:

\`\`\`json
${JSON.stringify(context.currentPage, null, 2)}
\`\`\`

When the user asks for changes, use the "patch" action format to make surgical updates rather than regenerating the entire page.
`

    return `${basePrompt}\n\n${pageContext}`
  }

  /**
   * Build messages array from conversation history or single prompt.
   */
  private buildMessages(
    prompt: string,
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: ConversationContext
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    // If we have conversation history, use it
    if (messages && messages.length > 0) {
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
    }

    // Otherwise, build single message from prompt
    return [
      {
        role: 'user' as const,
        content: prompt,
      },
    ]
  }
}

export async function* streamAgentResponse(request: ChatRequest) {
  const orchestrator = new AgentOrchestrator()
  const result = await orchestrator.runAgent(request)

  for await (const chunk of result.textStream) {
    yield {
      type: 'text' as const,
      content: chunk,
    }
  }

  yield { type: 'done' as const }
}
