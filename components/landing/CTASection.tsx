'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { CTAProps, ColorPalette, DesignStyle } from '@/types/agents'

interface CTASectionProps {
  props: CTAProps
  isPreview?: boolean
  palette?: ColorPalette
  style?: DesignStyle
}

const PALETTE_GRADIENTS: Record<ColorPalette, string> = {
  violet: 'from-violet-600 via-purple-600 to-indigo-700',
  ocean: 'from-cyan-500 via-blue-600 to-indigo-700',
  sunset: 'from-orange-500 via-rose-500 to-pink-600',
  forest: 'from-emerald-500 via-teal-600 to-cyan-700',
  midnight: 'from-slate-900 via-purple-900 to-slate-900',
  electric: 'from-blue-600 via-indigo-600 to-violet-700',
  rose: 'from-rose-400 via-pink-500 to-purple-600',
  aurora: 'from-green-400 via-cyan-500 to-blue-600',
}

const PALETTE_ACCENTS: Record<ColorPalette, string> = {
  violet: 'bg-violet-500',
  ocean: 'bg-cyan-500',
  sunset: 'bg-orange-500',
  forest: 'bg-emerald-500',
  midnight: 'bg-purple-500',
  electric: 'bg-blue-500',
  rose: 'bg-rose-500',
  aurora: 'bg-green-500',
}

export function CTASection({ props, isPreview, palette = 'violet', style = 'gradient' }: CTASectionProps) {
  const { headline, subheadline, ctaText, ctaLink, variant } = props
  const gradient = PALETTE_GRADIENTS[palette]
  const accent = PALETTE_ACCENTS[palette]

  // Glassmorphic/Dark Style
  if (style === 'glassmorphic' || style === 'dark') {
    return (
      <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
        {/* Background effects */}
        <div className={`absolute top-10 left-10 w-64 h-64 ${accent} rounded-full mix-blend-screen filter blur-[100px] opacity-20`} />
        <div className={`absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r ${gradient} rounded-full mix-blend-screen filter blur-[120px] opacity-15`} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 container mx-auto max-w-4xl text-center px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">{subheadline}</p>
          )}
          {isPreview ? (
            <Button size="lg" className={`h-12 px-8 text-base font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 border-0`}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Link href={ctaLink}>
              <Button size="lg" className={`h-12 px-8 text-base font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 border-0`}>
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    )
  }

  // Minimal Style
  if (style === 'minimal') {
    return (
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-4xl text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">{subheadline}</p>
          )}
          {isPreview ? (
            <Button size="lg" className="h-12 px-8 text-base font-medium rounded-full">
              {ctaText}
            </Button>
          ) : (
            <Link href={ctaLink}>
              <Button size="lg" className="h-12 px-8 text-base font-medium rounded-full">
                {ctaText}
              </Button>
            </Link>
          )}
        </div>
      </section>
    )
  }

  // Bold Style
  if (style === 'bold') {
    return (
      <section className={`py-20 md:py-28 bg-gradient-to-r ${gradient} relative overflow-hidden`}>
        {/* Geometric shapes */}
        <div className="absolute top-10 right-10 w-40 h-40 border border-white/20 rounded-full" />
        <div className="absolute bottom-10 left-10 w-24 h-24 border border-white/10 rounded-2xl rotate-12" />

        <div className="relative z-10 container mx-auto max-w-4xl text-center px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{subheadline}</p>
          )}
          {isPreview ? (
            <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-white/90 rounded-full shadow-2xl">
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Link href={ctaLink}>
              <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-white/90 rounded-full shadow-2xl">
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    )
  }

  // Default Gradient Style
  return (
    <section className={`py-20 md:py-28 bg-gradient-to-r ${gradient} relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="relative z-10 container mx-auto max-w-4xl text-center px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          {headline}
        </h2>
        {subheadline && (
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{subheadline}</p>
        )}
        {isPreview ? (
          <Button size="lg" className="h-12 px-8 text-base font-semibold bg-white text-slate-900 hover:bg-white/95 rounded-xl shadow-xl">
            {ctaText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Link href={ctaLink}>
            <Button size="lg" className="h-12 px-8 text-base font-semibold bg-white text-slate-900 hover:bg-white/95 rounded-xl shadow-xl">
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}
