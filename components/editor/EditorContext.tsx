'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { LandingPageStructure, Section } from '@/types/agents'

interface EditorContextType {
  structure: LandingPageStructure
  selectedSectionIndex: number | null
  setSelectedSectionIndex: (index: number | null) => void
  updateSection: (index: number, updates: Partial<Section>) => void
  updateSectionProps: (index: number, props: Record<string, unknown>) => void
  addSection: (section: Section, afterIndex?: number) => void
  removeSection: (index: number) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  updateTheme: (theme: Partial<LandingPageStructure['theme']>) => void
  updateMetadata: (metadata: Partial<LandingPageStructure['metadata']>) => void
}

const EditorContext = createContext<EditorContextType | null>(null)

interface EditorProviderProps {
  children: ReactNode
  initialStructure: LandingPageStructure
  onChange?: (structure: LandingPageStructure) => void
}

export function EditorProvider({ children, initialStructure, onChange }: EditorProviderProps) {
  const [structure, setStructure] = useState<LandingPageStructure>(initialStructure)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const isInitialMount = useRef(true)

  // Call onChange in useEffect to avoid calling setState during render
  useEffect(() => {
    // Skip the initial mount to avoid calling onChange with the initial value
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onChange?.(structure)
  }, [structure, onChange])

  const updateSection = useCallback((index: number, updates: Partial<Section>) => {
    setStructure(prev => {
      const newSections = [...prev.sections]
      newSections[index] = { ...newSections[index], ...updates }
      return { ...prev, sections: newSections }
    })
  }, [])

  const updateSectionProps = useCallback((index: number, props: Record<string, unknown>) => {
    setStructure(prev => {
      const newSections = [...prev.sections]
      newSections[index] = {
        ...newSections[index],
        props: { ...newSections[index].props, ...props }
      }
      return { ...prev, sections: newSections }
    })
  }, [])

  const addSection = useCallback((section: Section, afterIndex?: number) => {
    setStructure(prev => {
      const newSections = [...prev.sections]
      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : newSections.length
      newSections.splice(insertIndex, 0, section)
      return { ...prev, sections: newSections }
    })
  }, [])

  const removeSection = useCallback((index: number) => {
    setStructure(prev => {
      const newSections = prev.sections.filter((_, i) => i !== index)
      return { ...prev, sections: newSections }
    })
    setSelectedSectionIndex(null)
  }, [])

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setStructure(prev => {
      const newSections = [...prev.sections]
      const [removed] = newSections.splice(fromIndex, 1)
      newSections.splice(toIndex, 0, removed)
      return { ...prev, sections: newSections }
    })
    setSelectedSectionIndex(toIndex)
  }, [])

  const updateTheme = useCallback((theme: Partial<LandingPageStructure['theme']>) => {
    setStructure(prev => ({ ...prev, theme: { ...prev.theme, ...theme } }))
  }, [])

  const updateMetadata = useCallback((metadata: Partial<LandingPageStructure['metadata']>) => {
    setStructure(prev => ({ ...prev, metadata: { ...prev.metadata, ...metadata } }))
  }, [])

  return (
    <EditorContext.Provider value={{
      structure,
      selectedSectionIndex,
      setSelectedSectionIndex,
      updateSection,
      updateSectionProps,
      addSection,
      removeSection,
      moveSection,
      updateTheme,
      updateMetadata,
    }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
