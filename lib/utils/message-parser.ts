import type {
  ParsedAIContent,
  MultipleChoiceOption,
  AIAction,
  LandingPageStructure,
  JSONPatchOperation,
} from '@/types/agents'

/**
 * Parse multiple-choice options from AI response content.
 * Format: [[A]] Option text - description
 */
export function parseMultipleChoice(content: string): MultipleChoiceOption[] {
  const choices: MultipleChoiceOption[] = []
  // Match [[A]] or [[B]] etc. followed by text (using [\s\S] instead of 's' flag for compatibility)
  const regex = /\[\[([A-Z])\]\]\s*([\s\S]+?)(?=\[\[[A-Z]\]\]|$)/g

  let match
  while ((match = regex.exec(content)) !== null) {
    const key = match[1]
    const fullText = match[2].trim()

    // Split on " - " to separate label from description
    const dashIndex = fullText.indexOf(' - ')
    if (dashIndex > 0) {
      choices.push({
        key,
        label: fullText.substring(0, dashIndex).trim(),
        description: fullText.substring(dashIndex + 3).trim(),
      })
    } else {
      // No description, just use the full text as label
      choices.push({
        key,
        label: fullText.replace(/\n/g, ' ').trim(),
      })
    }
  }

  return choices
}

/**
 * Remove multiple-choice markers from text for clean display.
 */
export function removeChoiceMarkers(content: string): string {
  // Remove the [[X]] markers but keep the text
  return content.replace(/\[\[[A-Z]\]\]/g, '').trim()
}

/**
 * Check if content contains multiple-choice options.
 */
export function hasMultipleChoice(content: string): boolean {
  return /\[\[[A-Z]\]\]/.test(content)
}

/**
 * Extract JSON from AI response content.
 * Looks for ```json code blocks or raw JSON objects.
 */
export function extractJSON<T = unknown>(content: string): T | null {
  // Try to find JSON in code block first
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1]) as T
    } catch {
      // Continue to try other methods
    }
  }

  // Try to find raw JSON object with action field
  const actionJsonMatch = content.match(/\{[\s\S]*"action"[\s\S]*\}/)
  if (actionJsonMatch) {
    try {
      return JSON.parse(actionJsonMatch[0]) as T
    } catch {
      // Continue
    }
  }

  // Try to find raw JSON object with sections (legacy format)
  const sectionsJsonMatch = content.match(/\{[\s\S]*"sections"[\s\S]*\}/)
  if (sectionsJsonMatch) {
    try {
      return JSON.parse(sectionsJsonMatch[0]) as T
    } catch {
      // Couldn't parse
    }
  }

  return null
}

/**
 * Extract AI action from response content.
 * Returns generate/patch action or null if not found.
 */
export function extractAIAction(content: string): AIAction | null {
  console.log('[Parser] Extracting action from content length:', content.length)
  console.log('[Parser] Content has json block:', content.includes('```json'))

  const json = extractJSON<AIAction | LandingPageStructure>(content)
  console.log('[Parser] Extracted JSON:', json ? JSON.stringify(json).substring(0, 200) : 'null')

  if (!json) return null

  // Check if it's the new action format
  if ('action' in json && (json.action === 'generate' || json.action === 'patch')) {
    console.log('[Parser] Found action format:', json.action)
    return json as AIAction
  }

  // Legacy format - wrap in generate action
  if ('sections' in json) {
    console.log('[Parser] Found legacy format with sections')
    const legacy = json as LandingPageStructure
    return {
      action: 'generate',
      sections: legacy.sections,
      theme: legacy.theme,
      metadata: legacy.metadata,
    }
  }

  console.log('[Parser] JSON found but no valid action or sections')
  return null
}

/**
 * Parse full AI response content into structured data.
 */
export function parseAIContent(content: string): ParsedAIContent {
  const choices = parseMultipleChoice(content)
  const action = extractAIAction(content)

  // Clean text by removing JSON blocks for display
  let text = content
    .replace(/```json[\s\S]*?```/g, '')
    .trim()

  // If there are choices, we might want to clean up the text differently
  if (choices.length > 0) {
    // Split on the first choice marker to get intro text
    const firstChoiceIndex = text.search(/\[\[[A-Z]\]\]/)
    if (firstChoiceIndex > 0) {
      text = text.substring(0, firstChoiceIndex).trim()
    }
  }

  return {
    text,
    choices: choices.length > 0 ? choices : undefined,
    action: action || undefined,
  }
}

/**
 * Apply JSON patches to a landing page structure.
 * Simple implementation supporting replace, add, remove operations.
 */
export function applyPatches(
  page: LandingPageStructure,
  patches: JSONPatchOperation[]
): LandingPageStructure {
  // Deep clone to avoid mutation
  const result = JSON.parse(JSON.stringify(page)) as LandingPageStructure

  for (const patch of patches) {
    applyPatch(result, patch)
  }

  return result
}

/**
 * Apply a single JSON patch operation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyPatch(obj: any, patch: JSONPatchOperation): void {
  const pathParts = patch.path.split('/').filter(Boolean)

  if (pathParts.length === 0) return

  // Navigate to parent
  let current: Record<string, unknown> = obj
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i]
    const index = parseInt(key, 10)

    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index] as Record<string, unknown>
    } else {
      current = current[key] as Record<string, unknown>
    }

    if (!current) return // Path doesn't exist
  }

  const lastKey = pathParts[pathParts.length - 1]
  const lastIndex = parseInt(lastKey, 10)

  switch (patch.op) {
    case 'replace':
    case 'add':
      if (!isNaN(lastIndex) && Array.isArray(current)) {
        (current as unknown[])[lastIndex] = patch.value
      } else {
        current[lastKey] = patch.value
      }
      break
    case 'remove':
      if (!isNaN(lastIndex) && Array.isArray(current)) {
        (current as unknown[]).splice(lastIndex, 1)
      } else {
        delete current[lastKey]
      }
      break
  }
}

/**
 * Convert a landing page structure to the new action format.
 */
export function toGenerateAction(page: LandingPageStructure): AIAction {
  return {
    action: 'generate',
    sections: page.sections,
    theme: page.theme,
    metadata: page.metadata,
  }
}

/**
 * Convert an AI action to a landing page structure.
 */
export function actionToLandingPage(action: AIAction): LandingPageStructure | null {
  if (action.action !== 'generate') return null
  if (!action.sections || !action.theme || !action.metadata) return null

  return {
    sections: action.sections,
    theme: action.theme,
    metadata: action.metadata,
  }
}
