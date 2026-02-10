'use client'

import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { PricingSection } from './PricingSection'
import { TestimonialsSection } from './TestimonialsSection'
import { CTASection } from './CTASection'
import { FAQSection } from './FAQSection'
import { FooterSection } from './FooterSection'
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

interface LandingPageRendererProps {
  structure: LandingPageStructure
  isPreview?: boolean
}

export function LandingPageRenderer({
  structure,
  isPreview = false,
}: LandingPageRendererProps) {
  const { sections, theme } = structure
  const palette = theme.palette || 'violet'
  const style = theme.style || 'gradient'

  const renderSection = (section: Section, index: number) => {
    const key = `${section.type}-${index}`
    // Use section-specific style override if available, otherwise fall back to theme
    const sectionPalette = section.styleOverride?.palette || palette
    const sectionStyle = section.styleOverride?.style || style

    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            key={key}
            props={section.props as unknown as HeroProps}
            isPreview={isPreview}
            palette={sectionPalette}
            style={sectionStyle}
          />
        )
      case 'features':
        return (
          <FeaturesSection
            key={key}
            props={section.props as unknown as FeaturesProps}
            palette={sectionPalette}
            style={sectionStyle}
          />
        )
      case 'pricing':
        return (
          <PricingSection
            key={key}
            props={section.props as unknown as PricingProps}
            isPreview={isPreview}
            palette={sectionPalette}
            style={sectionStyle}
          />
        )
      case 'testimonials':
        return (
          <TestimonialsSection
            key={key}
            props={section.props as unknown as TestimonialsProps}
            palette={sectionPalette}
            style={sectionStyle}
          />
        )
      case 'cta':
        return (
          <CTASection
            key={key}
            props={section.props as unknown as CTAProps}
            isPreview={isPreview}
            palette={sectionPalette}
            style={sectionStyle}
          />
        )
      case 'faq':
        return (
          <FAQSection
            key={key}
            props={section.props as unknown as FAQProps}
            palette={sectionPalette}
            style={sectionStyle}
          />
        )
      case 'footer':
        return (
          <FooterSection
            key={key}
            props={section.props as unknown as FooterProps}
            isPreview={isPreview}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  )
}
