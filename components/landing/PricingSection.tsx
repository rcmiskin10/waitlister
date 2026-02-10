'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import type { PricingProps, ColorPalette, DesignStyle } from '@/types/agents'
import { cn } from '@/lib/utils'

interface PricingSectionProps {
  props: PricingProps
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

const PALETTE_COLORS: Record<ColorPalette, { accent: string; text: string; border: string }> = {
  violet: { accent: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-500' },
  ocean: { accent: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-500' },
  sunset: { accent: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
  forest: { accent: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500' },
  midnight: { accent: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
  electric: { accent: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500' },
  rose: { accent: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
  aurora: { accent: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
}

export function PricingSection({ props, isPreview, palette = 'violet', style = 'gradient' }: PricingSectionProps) {
  const { headline, plans } = props
  const gradient = PALETTE_GRADIENTS[palette]
  const colors = PALETTE_COLORS[palette]

  // Glassmorphic/Dark Style
  if (style === 'glassmorphic' || style === 'dark') {
    return (
      <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-12">
            {headline}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={cn(
                  'relative bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl',
                  plan.highlighted && `${colors.border} shadow-lg shadow-purple-500/10 scale-105`
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`bg-gradient-to-r ${gradient} text-white text-sm px-4 py-1 rounded-full font-medium`}>
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-white">
                      {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                    </span>
                    {plan.interval && (
                      <span className="text-slate-400">{plan.interval}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${colors.text}`} />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isPreview ? (
                    <Button
                      className={cn(
                        'w-full',
                        plan.highlighted
                          ? `bg-gradient-to-r ${gradient} text-white hover:opacity-90 border-0`
                          : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      )}
                    >
                      {plan.ctaText || 'Get Started'}
                    </Button>
                  ) : (
                    <Link href={plan.ctaLink || '/signup'}>
                      <Button
                        className={cn(
                          'w-full',
                          plan.highlighted
                            ? `bg-gradient-to-r ${gradient} text-white hover:opacity-90 border-0`
                            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                        )}
                      >
                        {plan.ctaText || 'Get Started'}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Bold Style
  if (style === 'bold') {
    return (
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-center text-slate-900 dark:text-white mb-12">
            {headline}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className="relative group">
                {plan.highlighted && (
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-75 blur`} />
                )}
                <Card
                  className={cn(
                    'relative bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl h-full',
                    plan.highlighted && 'scale-105'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`bg-gradient-to-r ${gradient} text-white text-sm px-4 py-1 rounded-full font-bold`}>
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-5xl font-black text-slate-900 dark:text-white">
                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                      </span>
                      {plan.interval && (
                        <span className="text-slate-500">{plan.interval}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className={`h-5 w-5 ${colors.text}`} />
                          <span className="text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isPreview ? (
                      <Button
                        className={cn(
                          'w-full h-12 font-bold rounded-xl',
                          plan.highlighted
                            ? `bg-gradient-to-r ${gradient} text-white hover:opacity-90`
                            : ''
                        )}
                        variant={plan.highlighted ? 'default' : 'outline'}
                      >
                        {plan.ctaText || 'Get Started'}
                      </Button>
                    ) : (
                      <Link href={plan.ctaLink || '/signup'}>
                        <Button
                          className={cn(
                            'w-full h-12 font-bold rounded-xl',
                            plan.highlighted
                              ? `bg-gradient-to-r ${gradient} text-white hover:opacity-90`
                              : ''
                          )}
                          variant={plan.highlighted ? 'default' : 'outline'}
                        >
                          {plan.ctaText || 'Get Started'}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Minimal Style
  if (style === 'minimal') {
    return (
      <section className="py-20 md:py-28 bg-white dark:bg-slate-950">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            {headline}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={cn(
                  'relative rounded-2xl',
                  plan.highlighted && `${colors.border} shadow-lg scale-105`
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`${colors.accent} text-white text-sm px-4 py-1 rounded-full`}>
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                    </span>
                    {plan.interval && (
                      <span className="text-slate-500">{plan.interval}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${colors.text}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isPreview ? (
                    <Button
                      className={cn('w-full rounded-full', plan.highlighted && colors.accent)}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.ctaText || 'Get Started'}
                    </Button>
                  ) : (
                    <Link href={plan.ctaLink || '/signup'}>
                      <Button
                        className={cn('w-full rounded-full', plan.highlighted && colors.accent)}
                        variant={plan.highlighted ? 'default' : 'outline'}
                      >
                        {plan.ctaText || 'Get Started'}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default Gradient Style
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 dark:text-white mb-12">
          {headline}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                'relative border-slate-200 dark:border-slate-800 rounded-2xl',
                plan.highlighted && `${colors.border} shadow-xl scale-105`
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`bg-gradient-to-r ${gradient} text-white text-sm px-4 py-1 rounded-full font-medium`}>
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {plan.interval && (
                    <span className="text-slate-500">{plan.interval}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${colors.text}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isPreview ? (
                  <Button
                    className={cn(
                      'w-full',
                      plan.highlighted && `bg-gradient-to-r ${gradient} hover:opacity-90`
                    )}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.ctaText || 'Get Started'}
                  </Button>
                ) : (
                  <Link href={plan.ctaLink || '/signup'}>
                    <Button
                      className={cn(
                        'w-full',
                        plan.highlighted && `bg-gradient-to-r ${gradient} hover:opacity-90`
                      )}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.ctaText || 'Get Started'}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
