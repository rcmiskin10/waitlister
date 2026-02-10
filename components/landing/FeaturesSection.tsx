'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Zap, Shield, Rocket, Target, Users, Clock,
  BarChart3, Globe, Lock, Sparkles, ArrowRight,
  CheckCircle2, Star, Layers, Cpu, Cloud
} from 'lucide-react'
import type { FeaturesProps, ColorPalette, DesignStyle } from '@/types/agents'

interface FeaturesSectionProps {
  props: FeaturesProps
  palette?: ColorPalette
  style?: DesignStyle
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  rocket: Rocket,
  target: Target,
  users: Users,
  clock: Clock,
  chart: BarChart3,
  globe: Globe,
  lock: Lock,
  sparkles: Sparkles,
  check: CheckCircle2,
  star: Star,
  layers: Layers,
  cpu: Cpu,
  cloud: Cloud,
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

const PALETTE_COLORS: Record<ColorPalette, { bg: string; text: string }> = {
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
  ocean: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  sunset: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  forest: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  midnight: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  electric: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-500' },
  aurora: { bg: 'bg-green-500/10', text: 'text-green-500' },
}

export function FeaturesSection({ props, palette = 'violet', style = 'gradient' }: FeaturesSectionProps) {
  const { headline, subheadline, features } = props as FeaturesProps & { subheadline?: string }
  const gradient = PALETTE_GRADIENTS[palette]
  const colors = PALETTE_COLORS[palette]

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName.toLowerCase()] || Zap
    return Icon
  }

  // Dark/Glassmorphic Style
  if (style === 'glassmorphic' || style === 'dark') {
    return (
      <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              {headline}
            </h2>
            {subheadline && (
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                {subheadline}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const IconComponent = getIcon(feature.icon)
              return (
                <Card
                  key={index}
                  className="bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 group rounded-2xl"
                >
                  <CardContent className="p-6 md:p-8">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Minimal Style
  if (style === 'minimal') {
    return (
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {headline}
            </h2>
            {subheadline && (
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {subheadline}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => {
              const IconComponent = getIcon(feature.icon)
              return (
                <div key={index} className="text-center">
                  <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Bold Style
  if (style === 'bold') {
    return (
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {headline}
            </h2>
            {subheadline && (
              <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {subheadline}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = getIcon(feature.icon)
              return (
                <div key={index} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur`} />
                  <Card className="relative bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                      <div className={`mt-4 flex items-center ${colors.text} font-medium text-sm`}>
                        Learn more <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Default Gradient Style
  return (
    <section className="py-24 md:py-32 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = getIcon(feature.icon)
            return (
              <Card
                key={index}
                className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl"
              >
                <CardContent className="p-6 md:p-8">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
