import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Rocket,
  Zap,
  Shield,
  BarChart,
  MessageSquare,
  Globe,
  Code,
  Database,
  Mail,
  Palette,
  GitBranch,
  Server,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react'

const mainFeatures = [
  {
    icon: MessageSquare,
    title: 'AI Agent System',
    description:
      'Four specialized AI agents powered by Claude to help you build, research, analyze, and monitor your SaaS.',
    details: [
      'Landing Page Generator - Create high-converting pages with AI',
      'Market Researcher - Validate ideas and analyze competitors',
      'Metrics Analyst - Get insights from your analytics data',
      'Social Listener - Monitor brand mentions and sentiment',
    ],
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/20 to-purple-600/20',
  },
  {
    icon: Zap,
    title: 'Stripe Billing',
    description:
      'Complete payment infrastructure with subscriptions, webhooks, and customer portal.',
    details: [
      'Subscription management with multiple tiers',
      'Secure webhook handling for real-time updates',
      'Customer portal for self-service billing',
      'Usage-based billing support',
    ],
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    icon: Shield,
    title: 'Supabase Authentication',
    description:
      'Enterprise-grade auth with multiple providers and row-level security.',
    details: [
      'Email/password and magic link authentication',
      'OAuth with Google, GitHub, and more',
      'Row-level security policies for data protection',
      'Session management and refresh tokens',
    ],
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/20 to-teal-600/20',
  },
  {
    icon: Globe,
    title: 'Landing Page Builder',
    description:
      'Generate and customize landing pages with AI, complete with live preview.',
    details: [
      'AI-generated content and structure',
      'Customizable section components',
      'Real-time preview while editing',
      'Export to static HTML or React',
    ],
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-500/20 to-rose-600/20',
  },
]

const techFeatures = [
  {
    icon: Code,
    title: 'TypeScript First',
    description: 'Full type safety across the entire codebase with strict mode enabled.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Palette,
    title: 'Tailwind CSS 4',
    description: 'Modern CSS-first configuration with custom theme support.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Database,
    title: 'PostgreSQL',
    description: 'Supabase-powered database with migrations and type generation.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: BarChart,
    title: 'PostHog Analytics',
    description: 'Product analytics with event tracking and user insights.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: Mail,
    title: 'Resend Email',
    description: 'Transactional emails with beautiful templates.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Server,
    title: 'Edge Ready',
    description: 'Optimized for edge deployment with Vercel.',
    gradient: 'from-neutral-600 to-neutral-800',
  },
  {
    icon: GitBranch,
    title: 'CI/CD Pipeline',
    description: 'GitHub Actions for automated testing and deployment.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: Rocket,
    title: 'One-Click Deploy',
    description: 'Deploy to Vercel with pre-configured environment variables.',
    gradient: 'from-indigo-500 to-violet-600',
  },
]

const codeQuality = [
  {
    title: 'TypeScript Strict',
    description: 'Full type safety with no any types and strict null checks.',
  },
  {
    title: 'CLAUDE.md Files',
    description: 'AI-friendly documentation in every directory for seamless assistance.',
  },
  {
    title: 'Testing Ready',
    description: 'Vitest and Playwright configured for unit and E2E testing.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Everything included
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              Features Built for
              <span className="block bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Speed & Scale
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400 sm:text-xl">
              Everything you need to launch a production-ready SaaS, without the months of setup time.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-32">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid gap-12 lg:grid-cols-2 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-4">
                        <div className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${feature.gradient}`}>
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-neutral-700 dark:text-neutral-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}
                >
                  <div className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${feature.bgGradient} p-1`}>
                    <div className="flex h-full w-full items-center justify-center rounded-[calc(1.5rem-4px)] bg-white dark:bg-neutral-900">
                      <div className={`rounded-2xl bg-gradient-to-br ${feature.bgGradient} p-8`}>
                        <feature.icon className={`h-24 w-24 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br ${feature.bgGradient} blur-2xl`} />
                  <div className={`absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-br ${feature.bgGradient} blur-2xl`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
              Developer experience
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Modern Tech Stack
            </p>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              Built with the latest tools and best practices for scalability and developer experience.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {techFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.gradient} transition-all group-hover:w-full`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Quality */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
              Quality first
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Production-Ready Code
            </p>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              Clean, maintainable code following industry best practices. Every file
              is documented, every pattern is intentional.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
            {codeQuality.map((item, index) => (
              <div key={item.title} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-24 text-center shadow-2xl sm:px-16">
            <svg
              className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
              aria-hidden="true"
            >
              <defs>
                <pattern id="grid-features" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M.5 40V.5H40" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-features)" />
            </svg>

            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Deploy your own instance in minutes and start building your SaaS today.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/deploy">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold shadow-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  Deploy Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="ghost" className="h-12 px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white">
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
