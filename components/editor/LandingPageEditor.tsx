'use client'

import { useRef, useCallback } from 'react'
import { EditorProvider, useEditor } from './EditorContext'
import { EditableSection } from './EditableSection'
import { SectionEditor } from './SectionEditor'
import { AddSectionMenu } from './AddSectionMenu'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FooterSection } from '@/components/landing/FooterSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, Palette, Type } from 'lucide-react'
import type {
  LandingPageStructure,
  Section,
  HeroProps,
  FeaturesProps,
  PricingProps,
  TestimonialsProps,
  CTAProps,
  FAQProps,
  FooterProps,
  ColorPalette,
  DesignStyle,
} from '@/types/agents'

interface LandingPageEditorProps {
  structure: LandingPageStructure
  onChange: (structure: LandingPageStructure) => void
}

export function LandingPageEditor({ structure, onChange }: LandingPageEditorProps) {
  return (
    <EditorProvider initialStructure={structure} onChange={onChange}>
      <EditorLayout />
    </EditorProvider>
  )
}

function EditorLayout() {
  const { structure, selectedSectionIndex } = useEditor()
  const palette = structure.theme.palette || 'violet'
  const style = structure.theme.style || 'gradient'
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll during drag when near edges
  const handleDragOver = useCallback((e: React.DragEvent) => {
    const container = scrollContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const scrollSpeed = 10
    const edgeThreshold = 80

    // Distance from top and bottom edges
    const distFromTop = e.clientY - rect.top
    const distFromBottom = rect.bottom - e.clientY

    // Clear existing interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }

    // Scroll up if near top
    if (distFromTop < edgeThreshold && distFromTop > 0) {
      const speed = Math.max(2, scrollSpeed * (1 - distFromTop / edgeThreshold))
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop -= speed
      }, 16)
    }
    // Scroll down if near bottom
    else if (distFromBottom < edgeThreshold && distFromBottom > 0) {
      const speed = Math.max(2, scrollSpeed * (1 - distFromBottom / edgeThreshold))
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop += speed
      }, 16)
    }
  }, [])

  const handleDragLeave = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }, [])

  const handleDrop = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }, [])

  return (
    <div className="flex h-full gap-4">
      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Live Preview</span>
          </div>
          <AddSectionMenu />
        </div>

        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full">
            <div
              ref={scrollContainerRef}
              className="h-full overflow-auto"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="bg-white dark:bg-slate-950">
                {structure.sections.map((section, index) => (
                  <EditableSection key={`${section.type}-${index}`} index={index} sectionType={section.type}>
                    {renderSection(section, index, palette, style)}
                  </EditableSection>
                ))}
                {structure.sections.length === 0 && (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <p>No sections yet</p>
                      <p className="text-sm">Click &quot;Add Section&quot; to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Section Editor or Theme */}
      <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden max-h-full">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-sm">
            {selectedSectionIndex !== null ? 'Edit Section' : 'Theme & Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
          {selectedSectionIndex !== null ? (
            <SectionEditor />
          ) : (
            <ThemeEditor />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ThemeEditor() {
  const { structure, updateTheme } = useEditor()

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label>Color Palette</Label>
          </div>
          <Select
            value={structure.theme.palette || 'violet'}
            onValueChange={(value) => updateTheme({ palette: value as ColorPalette })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="violet">Violet</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
              <SelectItem value="sunset">Sunset</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
              <SelectItem value="midnight">Midnight</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="rose">Rose</SelectItem>
              <SelectItem value="aurora">Aurora</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Label>Design Style</Label>
          </div>
          <Select
            value={structure.theme.style || 'gradient'}
            onValueChange={(value) => updateTheme({ style: value as DesignStyle })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="glassmorphic">Glassmorphic</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          <p>Click on any section in the preview to edit its content.</p>
          <p className="mt-2">Use the toolbar that appears on hover to reorder or remove sections.</p>
        </div>
      </div>
    </ScrollArea>
  )
}

function renderSection(section: Section, index: number, themePalette: ColorPalette, themeStyle: DesignStyle) {
  // Use section-specific style override if available, otherwise fall back to theme
  const palette = section.styleOverride?.palette || themePalette
  const style = section.styleOverride?.style || themeStyle

  switch (section.type) {
    case 'hero':
      return (
        <HeroSection
          props={section.props as unknown as HeroProps}
          isPreview={true}
          palette={palette}
          style={style}
        />
      )
    case 'features':
      return (
        <FeaturesSection
          props={section.props as unknown as FeaturesProps}
          palette={palette}
          style={style}
        />
      )
    case 'pricing':
      return (
        <PricingSection
          props={section.props as unknown as PricingProps}
          isPreview={true}
          palette={palette}
          style={style}
        />
      )
    case 'testimonials':
      return (
        <TestimonialsSection
          props={section.props as unknown as TestimonialsProps}
          palette={palette}
          style={style}
        />
      )
    case 'cta':
      return (
        <CTASection
          props={section.props as unknown as CTAProps}
          isPreview={true}
          palette={palette}
          style={style}
        />
      )
    case 'faq':
      return (
        <FAQSection
          props={section.props as unknown as FAQProps}
          palette={palette}
          style={style}
        />
      )
    case 'footer':
      return (
        <FooterSection
          props={section.props as unknown as FooterProps}
          isPreview={true}
          palette={palette}
          style={style}
        />
      )
    default:
      return null
  }
}
