'use client'

import { Button } from '@/components/ui/button'
import type { MultipleChoiceOption } from '@/types/agents'

interface MultipleChoiceButtonsProps {
  choices: MultipleChoiceOption[]
  onSelect: (choice: MultipleChoiceOption) => void
  disabled?: boolean
}

export function MultipleChoiceButtons({
  choices,
  onSelect,
  disabled = false,
}: MultipleChoiceButtonsProps) {
  if (!choices || choices.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mt-3">
      {choices.map((choice) => (
        <Button
          key={choice.key}
          variant="outline"
          className="justify-start text-left h-auto py-3 px-4 whitespace-normal hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950 dark:hover:border-violet-700 transition-colors"
          onClick={() => onSelect(choice)}
          disabled={disabled}
        >
          <span className="inline-flex items-center gap-3 w-full">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center">
              {choice.key}
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="font-medium text-sm">{choice.label}</span>
              {choice.description && (
                <span className="text-xs text-muted-foreground">
                  {choice.description}
                </span>
              )}
            </span>
          </span>
        </Button>
      ))}
    </div>
  )
}
