'use client'

import { useState } from 'react'
import { useEditor } from './EditorContext'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, ChevronUp, ChevronDown, Pencil, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableSectionProps {
  index: number
  children: React.ReactNode
  sectionType: string
}

export function EditableSection({ index, children, sectionType }: EditableSectionProps) {
  const {
    selectedSectionIndex,
    setSelectedSectionIndex,
    removeSection,
    moveSection,
    structure,
  } = useEditor()

  const isSelected = selectedSectionIndex === index
  const canMoveUp = index > 0
  const canMoveDown = index < structure.sections.length - 1

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSectionIndex(isSelected ? null : index)
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canMoveUp) moveSection(index, index - 1)
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canMoveDown) moveSection(index, index + 1)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeSection(index)
  }

  return (
    <div
      className={cn(
        'relative group',
        isSelected && 'ring-2 ring-violet-500 ring-offset-2'
      )}
      onClick={handleSelect}
    >
      {/* Large Move Controls - Left side */}
      <div
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-50',
          'flex flex-col gap-1',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isSelected && 'opacity-100'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 shadow-lg"
          onClick={handleMoveUp}
          disabled={!canMoveUp}
          title="Move up"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <div className="flex items-center justify-center h-8 w-10 bg-white dark:bg-slate-800 rounded-md shadow-lg border text-sm font-bold text-slate-600">
          {index + 1}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 shadow-lg"
          onClick={handleMoveDown}
          disabled={!canMoveDown}
          title="Move down"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Hover/Selected Toolbar - Right side */}
      <div
        className={cn(
          'absolute top-2 right-2 z-50 flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border p-1',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isSelected && 'opacity-100'
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Section type label */}
        <div className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 border-r mr-1">
          {sectionType}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSelect}
          title="Edit section"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={handleRemove}
          title="Remove section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Section Content */}
      <div className={cn(
        'transition-all',
        isSelected && 'brightness-[0.98]'
      )}>
        {children}
      </div>
    </div>
  )
}
