'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import type { HeroProps, ColorPalette, DesignStyle } from '@/types/agents'

interface HeroSectionProps {
  props: HeroProps
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

export function HeroSection({ props, isPreview, palette = 'violet', style = 'gradient' }: HeroSectionProps) {
  const { headline, subheadline, ctaText, ctaLink, secondaryCtaText, badge, image } = props as HeroProps & { secondaryCtaText?: string; badge?: string }
  const gradient = PALETTE_GRADIENTS[palette]
  const accent = PALETTE_ACCENTS[palette]

  // Glassmorphic Dark Style
  if (style === 'glassmorphic' || style === 'dark') {
    return (
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated background blobs */}
        <div className={`absolute top-20 left-10 w-72 h-72 ${accent} rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r ${gradient} rounded-full mix-blend-screen filter blur-[120px] opacity-20`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-[100px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-4xl text-center">
            {badge && (
              <Badge className={`mb-6 bg-gradient-to-r ${gradient} text-white border-0 px-4 py-1.5 text-sm font-medium`}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {badge}
              </Badge>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              {headline}
            </h1>

            {subheadline && (
              <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {subheadline}
              </p>
            )}

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isPreview ? (
                <Button size="lg" className={`h-14 px-8 text-lg font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 border-0 rounded-xl shadow-lg shadow-purple-500/25`}>
                  {ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Link href={ctaLink}>
                  <Button size="lg" className={`h-14 px-8 text-lg font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 border-0 rounded-xl shadow-lg shadow-purple-500/25`}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}

              {secondaryCtaText && (
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-slate-700 text-white hover:bg-white/5 rounded-xl">
                  <Play className="mr-2 h-5 w-5" />
                  {secondaryCtaText}
                </Button>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-900" />
                ))}
              </div>
              <span className="ml-3 text-sm">Trusted by <span className="text-white font-semibold">2,000+</span> teams</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Minimal Style
  if (style === 'minimal') {
    return (
      <section className="relative min-h-[85vh] bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-3xl text-center">
            {badge && (
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium rounded-full">
                {badge}
              </Badge>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
              {headline}
            </h1>

            {subheadline && (
              <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                {subheadline}
              </p>
            )}

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isPreview ? (
                <Button size="lg" className="h-12 px-8 text-base font-medium rounded-full">
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Link href={ctaLink}>
                  <Button size="lg" className="h-12 px-8 text-base font-medium rounded-full">
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Bold Style
  if (style === 'bold') {
    return (
      <section className={`relative min-h-[90vh] bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-white/20 rounded-3xl rotate-12" />
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/10 rounded-full" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-4xl text-center">
            {badge && (
              <Badge className="mb-6 bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                {badge}
              </Badge>
            )}

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95]">
              {headline}
            </h1>

            {subheadline && (
              <p className="mt-8 text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto">
                {subheadline}
              </p>
            )}

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
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

              {secondaryCtaText && (
                <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 rounded-full">
                  {secondaryCtaText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default Gradient Style
  return (
    <section className={`relative min-h-[90vh] bg-gradient-to-br ${gradient} overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="mx-auto max-w-4xl text-center">
          {badge && (
            <Badge className="mb-6 bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {badge}
            </Badge>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            {headline}
          </h1>

          {subheadline && (
            <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {subheadline}
            </p>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isPreview ? (
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-white text-slate-900 hover:bg-white/95 rounded-xl shadow-xl">
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Link href={ctaLink}>
                <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-white text-slate-900 hover:bg-white/95 rounded-xl shadow-xl">
                  {ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}

            {secondaryCtaText && (
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 rounded-xl">
                <Play className="mr-2 h-5 w-5" />
                {secondaryCtaText}
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm mb-4">Trusted by innovative teams at</p>
            <div className="flex items-center justify-center gap-8 opacity-70">
              {['Company', 'Brand', 'Startup', 'Enterprise'].map((name) => (
                <span key={name} className="text-white font-semibold text-lg">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
