'use client'

import { useEditor } from './EditorContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Plus, Trash2, Palette } from 'lucide-react'
import type { Section, HeroProps, FeaturesProps, PricingProps, TestimonialsProps, FAQProps, CTAProps, ColorPalette, DesignStyle, SectionStyleOverride } from '@/types/agents'

const COLOR_PALETTES: { value: ColorPalette; label: string; preview: string }[] = [
  { value: 'violet', label: 'Violet', preview: 'bg-gradient-to-r from-violet-600 to-indigo-700' },
  { value: 'ocean', label: 'Ocean', preview: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
  { value: 'sunset', label: 'Sunset', preview: 'bg-gradient-to-r from-orange-500 to-pink-600' },
  { value: 'forest', label: 'Forest', preview: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  { value: 'midnight', label: 'Midnight', preview: 'bg-gradient-to-r from-slate-900 to-purple-900' },
  { value: 'electric', label: 'Electric', preview: 'bg-gradient-to-r from-blue-600 to-violet-700' },
  { value: 'rose', label: 'Rose', preview: 'bg-gradient-to-r from-rose-400 to-purple-600' },
  { value: 'aurora', label: 'Aurora', preview: 'bg-gradient-to-r from-green-400 to-blue-600' },
]

const DESIGN_STYLES: { value: DesignStyle; label: string; description: string }[] = [
  { value: 'glassmorphic', label: 'Glassmorphic', description: 'Dark with blur effects' },
  { value: 'gradient', label: 'Gradient', description: 'Colorful gradient backgrounds' },
  { value: 'minimal', label: 'Minimal', description: 'Clean with whitespace' },
  { value: 'bold', label: 'Bold', description: 'Large typography, strong colors' },
  { value: 'dark', label: 'Dark', description: 'Dark mode aesthetic' },
]

// Style Selector Component for per-section styling
function StyleSelector({
  styleOverride,
  themePalette,
  themeStyle,
  onChange,
}: {
  styleOverride?: SectionStyleOverride
  themePalette: ColorPalette
  themeStyle: DesignStyle
  onChange: (override: SectionStyleOverride | undefined) => void
}) {
  const currentPalette = styleOverride?.palette || themePalette
  const currentStyle = styleOverride?.style || themeStyle
  const hasOverride = styleOverride?.palette || styleOverride?.style

  const handlePaletteChange = (value: string) => {
    if (value === 'theme') {
      // Reset to theme
      const newOverride = { ...styleOverride }
      delete newOverride.palette
      onChange(Object.keys(newOverride).length ? newOverride : undefined)
    } else {
      onChange({ ...styleOverride, palette: value as ColorPalette })
    }
  }

  const handleStyleChange = (value: string) => {
    if (value === 'theme') {
      // Reset to theme
      const newOverride = { ...styleOverride }
      delete newOverride.style
      onChange(Object.keys(newOverride).length ? newOverride : undefined)
    } else {
      onChange({ ...styleOverride, style: value as DesignStyle })
    }
  }

  return (
    <div className="space-y-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Palette className="h-4 w-4" />
        Section Style
        {hasOverride && (
          <span className="ml-auto text-xs text-violet-600 dark:text-violet-400">Custom</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Color Palette</Label>
          <Select value={styleOverride?.palette || 'theme'} onValueChange={handlePaletteChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theme">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${COLOR_PALETTES.find(p => p.value === themePalette)?.preview}`} />
                  <span>Use Theme ({themePalette})</span>
                </div>
              </SelectItem>
              <Separator className="my-1" />
              {COLOR_PALETTES.map((palette) => (
                <SelectItem key={palette.value} value={palette.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${palette.preview}`} />
                    <span>{palette.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Design Style</Label>
          <Select value={styleOverride?.style || 'theme'} onValueChange={handleStyleChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theme">
                <span>Use Theme ({themeStyle})</span>
              </SelectItem>
              <Separator className="my-1" />
              {DESIGN_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex flex-col">
                    <span>{style.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export function SectionEditor() {
  const { structure, selectedSectionIndex, setSelectedSectionIndex, updateSectionProps, updateSection } = useEditor()

  if (selectedSectionIndex === null) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6">
        <div className="text-muted-foreground">
          <p className="text-sm">Click on a section to edit it</p>
        </div>
      </div>
    )
  }

  const section = structure.sections[selectedSectionIndex]
  if (!section) return null

  const handlePropChange = (key: string, value: unknown) => {
    updateSectionProps(selectedSectionIndex, { [key]: value })
  }

  const handleStyleChange = (styleOverride: SectionStyleOverride | undefined) => {
    updateSection(selectedSectionIndex, { styleOverride })
  }

  // Sections that support style overrides (those with backgrounds)
  const supportsStyleOverride = ['hero', 'cta', 'features', 'pricing'].includes(section.type)

  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return <HeroEditor props={section.props as unknown as HeroProps} onChange={handlePropChange} />
      case 'features':
        return <FeaturesEditor props={section.props as unknown as FeaturesProps} onChange={handlePropChange} />
      case 'pricing':
        return <PricingEditor props={section.props as unknown as PricingProps} onChange={handlePropChange} />
      case 'testimonials':
        return <TestimonialsEditor props={section.props as unknown as TestimonialsProps} onChange={handlePropChange} />
      case 'faq':
        return <FAQEditor props={section.props as unknown as FAQProps} onChange={handlePropChange} />
      case 'cta':
        return <CTAEditor props={section.props as unknown as CTAProps} onChange={handlePropChange} />
      default:
        return <div className="p-4 text-sm text-muted-foreground">No editor available for this section type</div>
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <h3 className="font-semibold capitalize">{section.type} Section</h3>
        <Button variant="ghost" size="icon" onClick={() => setSelectedSectionIndex(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Style selector for sections that support it */}
          {supportsStyleOverride && (
            <>
              <StyleSelector
                styleOverride={section.styleOverride}
                themePalette={structure.theme.palette}
                themeStyle={structure.theme.style}
                onChange={handleStyleChange}
              />
              <Separator />
            </>
          )}
          {renderEditor()}
        </div>
      </div>
    </div>
  )
}

// Hero Section Editor
function HeroEditor({ props, onChange }: { props: HeroProps; onChange: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={props.headline || ''}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="Your main headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Subheadline</Label>
        <Textarea
          value={props.subheadline || ''}
          onChange={(e) => onChange('subheadline', e.target.value)}
          placeholder="Supporting text"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Badge Text</Label>
        <Input
          value={props.badge || ''}
          onChange={(e) => onChange('badge', e.target.value)}
          placeholder="e.g., Now in Beta"
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Primary CTA Text</Label>
        <Input
          value={props.ctaText || ''}
          onChange={(e) => onChange('ctaText', e.target.value)}
          placeholder="Get Started"
        />
      </div>
      <div className="space-y-2">
        <Label>Primary CTA Link</Label>
        <Input
          value={props.ctaLink || ''}
          onChange={(e) => onChange('ctaLink', e.target.value)}
          placeholder="/signup"
        />
      </div>
      <div className="space-y-2">
        <Label>Secondary CTA Text</Label>
        <Input
          value={props.secondaryCtaText || ''}
          onChange={(e) => onChange('secondaryCtaText', e.target.value)}
          placeholder="Learn More"
        />
      </div>
    </div>
  )
}

// Features Section Editor
function FeaturesEditor({ props, onChange }: { props: FeaturesProps; onChange: (key: string, value: unknown) => void }) {
  const features = props.features || []

  const updateFeature = (index: number, key: string, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = { ...newFeatures[index], [key]: value }
    onChange('features', newFeatures)
  }

  const addFeature = () => {
    onChange('features', [...features, { icon: 'zap', title: 'New Feature', description: 'Feature description' }])
  }

  const removeFeature = (index: number) => {
    onChange('features', features.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={props.headline || ''}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="Features headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Subheadline</Label>
        <Textarea
          value={(props as FeaturesProps & { subheadline?: string }).subheadline || ''}
          onChange={(e) => onChange('subheadline', e.target.value)}
          placeholder="Supporting text"
          rows={2}
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Features ({features.length})</Label>
          <Button variant="outline" size="sm" onClick={addFeature}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {features.map((feature, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Feature {index + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFeature(index)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={feature.icon || ''}
              onChange={(e) => updateFeature(index, 'icon', e.target.value)}
              placeholder="Icon name"
              className="text-xs"
            />
            <Input
              value={feature.title || ''}
              onChange={(e) => updateFeature(index, 'title', e.target.value)}
              placeholder="Feature title"
            />
            <Textarea
              value={feature.description || ''}
              onChange={(e) => updateFeature(index, 'description', e.target.value)}
              placeholder="Feature description"
              rows={2}
              className="text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Pricing Section Editor
function PricingEditor({ props, onChange }: { props: PricingProps; onChange: (key: string, value: unknown) => void }) {
  const plans = props.plans || []

  const updatePlan = (index: number, key: string, value: unknown) => {
    const newPlans = [...plans]
    newPlans[index] = { ...newPlans[index], [key]: value }
    onChange('plans', newPlans)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={props.headline || ''}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="Pricing headline"
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Pricing Plans ({plans.length})</Label>
        {plans.map((plan, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Plan {index + 1}</span>
            <Input
              value={plan.name || ''}
              onChange={(e) => updatePlan(index, 'name', e.target.value)}
              placeholder="Plan name"
            />
            <div className="flex gap-2">
              <Input
                value={plan.price || ''}
                onChange={(e) => updatePlan(index, 'price', e.target.value)}
                placeholder="Price"
                className="flex-1"
              />
              <Input
                value={plan.interval || ''}
                onChange={(e) => updatePlan(index, 'interval', e.target.value)}
                placeholder="/month"
                className="w-20"
              />
            </div>
            <Textarea
              value={plan.features?.join('\n') || ''}
              onChange={(e) => updatePlan(index, 'features', e.target.value.split('\n'))}
              placeholder="Features (one per line)"
              rows={3}
              className="text-sm"
            />
            <Input
              value={plan.ctaText || ''}
              onChange={(e) => updatePlan(index, 'ctaText', e.target.value)}
              placeholder="CTA text"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Testimonials Section Editor
function TestimonialsEditor({ props, onChange }: { props: TestimonialsProps; onChange: (key: string, value: unknown) => void }) {
  const testimonials = props.testimonials || []

  const updateTestimonial = (index: number, key: string, value: string) => {
    const newTestimonials = [...testimonials]
    newTestimonials[index] = { ...newTestimonials[index], [key]: value }
    onChange('testimonials', newTestimonials)
  }

  const addTestimonial = () => {
    onChange('testimonials', [...testimonials, { quote: 'New testimonial', author: 'Author Name', role: 'Role' }])
  }

  const removeTestimonial = (index: number) => {
    onChange('testimonials', testimonials.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={props.headline || ''}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="Testimonials headline"
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Testimonials ({testimonials.length})</Label>
          <Button variant="outline" size="sm" onClick={addTestimonial}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Testimonial {index + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTestimonial(index)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              value={testimonial.quote || ''}
              onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
              placeholder="Quote"
              rows={2}
            />
            <Input
              value={testimonial.author || ''}
              onChange={(e) => updateTestimonial(index, 'author', e.target.value)}
              placeholder="Author name"
            />
            <Input
              value={testimonial.role || ''}
              onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
              placeholder="Role/Company"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// FAQ Section Editor
function FAQEditor({ props, onChange }: { props: FAQProps; onChange: (key: string, value: unknown) => void }) {
  const questions = props.questions || []

  const updateQuestion = (index: number, key: string, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [key]: value }
    onChange('questions', newQuestions)
  }

  const addQuestion = () => {
    onChange('questions', [...questions, { question: 'New question?', answer: 'Answer here.' }])
  }

  const removeQuestion = (index: number) => {
    onChange('questions', questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={props.headline || ''}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="FAQ headline"
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Questions ({questions.length})</Label>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {questions.map((q, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Q{index + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeQuestion(index)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={q.question || ''}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Question"
            />
            <Textarea
              value={q.answer || ''}
              onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
              placeholder="Answer"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// CTA Section Editor
function CTAEditor({ props, onChange }: { props: CTAProps; onChange: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={props.headline || ''}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="CTA headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Subheadline</Label>
        <Textarea
          value={props.subheadline || ''}
          onChange={(e) => onChange('subheadline', e.target.value)}
          placeholder="Supporting text"
          rows={2}
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>CTA Text</Label>
        <Input
          value={props.ctaText || ''}
          onChange={(e) => onChange('ctaText', e.target.value)}
          placeholder="Button text"
        />
      </div>
      <div className="space-y-2">
        <Label>CTA Link</Label>
        <Input
          value={props.ctaLink || ''}
          onChange={(e) => onChange('ctaLink', e.target.value)}
          placeholder="/signup"
        />
      </div>
    </div>
  )
}
