import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Rocket,
  ArrowRight,
  Check,
  Sparkles,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { LandingPageRenderer } from '@/components/landing/LandingPageRenderer'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { siteConfig } from '@/config/site'
import { getGradientClasses } from '@/config/theme'
import type { LandingPageStructure } from '@/types/agents'

interface PublishedPage {
  id: string
  content: LandingPageStructure
  theme: LandingPageStructure['theme']
  metadata: LandingPageStructure['metadata']
}

async function getPublishedLandingPage(): Promise<PublishedPage | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const supabase = await createClient()
    const { data: page, error } = await supabase
      .from('landing_pages')
      .select('id, content, theme, metadata')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !page) {
      return null
    }

    return page as PublishedPage
  } catch {
    return null
  }
}

const { hero, features, techStack } = siteConfig
const gradient = getGradientClasses()

const agents = [
  {
    title: 'Landing Page Generator',
    desc: 'Create conversion-optimized landing pages with AI',
  },
  {
    title: 'Market Researcher',
    desc: 'Validate ideas and find competitors automatically',
  },
  {
    title: 'Metrics Analyst',
    desc: 'Get insights from your analytics data',
  },
  {
    title: 'Social Listener',
    desc: 'Monitor mentions and sentiment across platforms',
  },
]

function DefaultLandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              {hero.badge}
              <ChevronRight className="h-4 w-4" />
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
              {hero.headline.endsWith(hero.headlineHighlight)
                ? hero.headline.slice(0, -hero.headlineHighlight.length).trim()
                : hero.headline}
              <span className={`block bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {hero.headlineHighlight}
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400 sm:text-xl">
              {hero.subheadline}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={hero.primaryCta.href}>
                <Button size="lg" className={`h-12 px-8 text-base font-semibold shadow-lg shadow-violet-500/25 bg-gradient-to-r ${gradient} hover:opacity-90`}>
                  <Rocket className="mr-2 h-5 w-5" />
                  {hero.primaryCta.text}
                </Button>
              </Link>
              <Link href={hero.secondaryCta.href}>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-2">
                  {hero.secondaryCta.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            {hero.socialProof && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{hero.socialProof.text}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">{hero.socialProof.rating}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-violet-600 dark:text-violet-400">
              Everything included
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Everything You Need to Ship
            </p>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              Stop wasting time on repetitive setup. Get a production-ready foundation
              with all the essentials built in.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.gradient} transition-all group-hover:w-full`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Built with Modern Tech
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              The latest and greatest tools for building scalable applications.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech.name}
                className={`${tech.color} rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-transform hover:scale-105`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-base font-semibold leading-7 text-violet-600 dark:text-violet-400">
                Powered by Claude AI
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                4 AI Agents Ready to Work
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
                Each agent is specialized for a specific task, helping you validate
                ideas, create content, and understand your market.
              </p>
              <ul className="mt-8 space-y-4">
                {agents.map((agent) => (
                  <li key={agent.title} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                        <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white">{agent.title}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{agent.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/features">
                  <Button variant="outline" className="font-semibold">
                    Explore all features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-1 shadow-2xl">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-[calc(1.5rem-4px)] bg-white dark:bg-neutral-900">
                  <div className="rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 p-6 dark:from-violet-900/50 dark:to-indigo-900/50">
                    <MessageSquare className="h-20 w-20 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">Powered by Claude AI</p>
                  <p className="mt-2 text-neutral-500 dark:text-neutral-400">Anthropic&apos;s most capable model</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`relative isolate overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} px-6 py-24 text-center shadow-2xl sm:px-16`}>
            {/* Background pattern */}
            <svg
              className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
              aria-hidden="true"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M.5 40V.5H40" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
            </svg>

            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Launch?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/80">
              Deploy your SaaS in minutes. All you need is a Vercel account and
              your API keys.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href={hero.primaryCta.href}>
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold shadow-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  {hero.primaryCta.text}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default async function HomePage() {
  const publishedPage = await getPublishedLandingPage()

  // If there's a published landing page, render it
  if (publishedPage) {
    const structure: LandingPageStructure = {
      sections: publishedPage.content.sections || [],
      theme: publishedPage.theme || publishedPage.content.theme || {
        primaryColor: '#7c3aed',
        secondaryColor: '#6366f1',
        font: 'Inter',
        palette: 'violet',
        style: 'gradient',
      },
      metadata: publishedPage.metadata || publishedPage.content.metadata || {
        title: 'Landing Page',
        description: '',
      },
    }

    return <LandingPageRenderer structure={structure} isPreview={false} />
  }

  // Otherwise, show the default landing page
  return <DefaultLandingPage />
}
