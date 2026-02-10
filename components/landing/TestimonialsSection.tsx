'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Quote, Star } from 'lucide-react'
import type { TestimonialsProps, ColorPalette, DesignStyle } from '@/types/agents'

interface TestimonialsSectionProps {
  props: TestimonialsProps
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

const PALETTE_COLORS: Record<ColorPalette, { text: string; bg: string; border: string }> = {
  violet: { text: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  ocean: { text: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  sunset: { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  forest: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  midnight: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  electric: { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  rose: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  aurora: { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
}

export function TestimonialsSection({ props, palette = 'violet', style = 'gradient' }: TestimonialsSectionProps) {
  const { headline, testimonials } = props
  const gradient = PALETTE_GRADIENTS[palette]
  const colors = PALETTE_COLORS[palette]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Glassmorphic/Dark Style
  if (style === 'glassmorphic' || style === 'dark') {
    return (
      <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-12">
            {headline}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl">
                <CardContent className="pt-6">
                  <Quote className={`w-8 h-8 ${colors.text} mb-4 opacity-50`} />
                  <blockquote className="text-slate-300 mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-slate-700">
                      {testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      ) : null}
                      <AvatarFallback className="bg-slate-800 text-white">{getInitials(testimonial.author)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      {testimonial.role && (
                        <div className="text-sm text-slate-400">
                          {testimonial.role}
                        </div>
                      )}
                    </div>
                  </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur`} />
                <Card className="relative bg-white dark:bg-slate-800 border-0 shadow-xl rounded-2xl h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${colors.text} fill-current`} />
                      ))}
                    </div>
                    <blockquote className="text-slate-600 dark:text-slate-300 mb-6 font-medium leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        ) : null}
                        <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold`}>{getInitials(testimonial.author)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                        {testimonial.role && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {testimonial.role}
                          </div>
                        )}
                      </div>
                    </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border rounded-2xl">
                <CardContent className="pt-6">
                  <blockquote className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      ) : null}
                      <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                      {testimonial.role && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {testimonial.role}
                        </div>
                      )}
                    </div>
                  </div>
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
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-900 dark:text-white mb-12">
          {headline}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                  <Quote className={`w-5 h-5 ${colors.text}`} />
                </div>
                <blockquote className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <Avatar className="border-2 border-slate-200 dark:border-slate-700">
                    {testimonial.avatar ? (
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    ) : null}
                    <AvatarFallback className={`${colors.bg} ${colors.text}`}>{getInitials(testimonial.author)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                    {testimonial.role && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
