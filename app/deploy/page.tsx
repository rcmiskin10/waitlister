'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Rocket,
  Zap,
  Shield,
  BarChart,
  MessageSquare,
  Globe,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: '4 AI Agents',
    description:
      'Landing page generator, market researcher, metrics analyst, and social listener powered by Claude.',
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/20 to-purple-600/20',
  },
  {
    icon: Zap,
    title: 'Stripe Billing',
    description:
      'Subscriptions, webhooks, and customer portal configured and ready for production.',
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    icon: Shield,
    title: 'Supabase Auth',
    description:
      'Authentication with email, OAuth, and row-level security policies.',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/20 to-teal-600/20',
  },
  {
    icon: BarChart,
    title: 'PostHog Analytics',
    description:
      'Product analytics integration for tracking user behavior and insights.',
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    icon: Globe,
    title: 'Landing Pages',
    description:
      'AI-generated landing pages with customizable sections and live preview.',
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-500/20 to-rose-600/20',
  },
  {
    icon: Rocket,
    title: 'Production Ready',
    description:
      'TypeScript strict mode, Tailwind CSS 4, shadcn/ui, and best practices.',
    gradient: 'from-indigo-500 to-violet-600',
    bgGradient: 'from-indigo-500/20 to-violet-600/20',
  },
]

const steps = [
  {
    step: '1',
    title: 'Enter Project Name',
    description: 'Choose a name for your new SaaS project.',
  },
  {
    step: '2',
    title: 'Configure Services',
    description: 'Add your API keys for Supabase, Stripe, and Anthropic.',
  },
  {
    step: '3',
    title: 'Deploy & Launch',
    description: 'Your SaaS is live in minutes, ready to customize.',
  },
]

export default function DeployPage() {
  const [projectName, setProjectName] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = () => {
    if (!projectName.trim()) return
    setIsDeploying(true)

    // Create Vercel deploy URL
    const repoUrl = 'https://github.com/your-org/saasify' // Replace with actual repo
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_PRICE_PRO',
      'ANTHROPIC_API_KEY',
      'NEXT_PUBLIC_POSTHOG_KEY',
      'NEXT_PUBLIC_POSTHOG_HOST',
      'RESEND_API_KEY',
      'NEXT_PUBLIC_APP_URL',
    ]

    const envQueryString = envVars.map((key) => `env=${key}`).join('&')
    const projectSlug = projectName.toLowerCase().replace(/\s+/g, '-')

    const deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(
      repoUrl
    )}&project-name=${projectSlug}&${envQueryString}`

    window.open(deployUrl, '_blank')
    setIsDeploying(false)
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <Rocket className="h-4 w-4" />
              One-click deploy
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              Launch Your SaaS
              <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                In Minutes
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400 sm:text-xl">
              Deploy a production-ready SaaS with AI agents, billing, auth, and analytics.
              Just add your API keys and start building.
            </p>
          </div>

          {/* Deploy Card */}
          <div className="mx-auto mt-12 max-w-md">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-white p-8 shadow-xl shadow-indigo-500/10 dark:border-indigo-800 dark:bg-neutral-900">
              <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-violet-600" />

              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                  <Rocket className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Deploy to Vercel</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Enter your project name and deploy with one click.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-medium text-neutral-900 dark:text-white">
                    Project Name
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="my-saas-app"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-base dark:border-neutral-800 dark:bg-neutral-800"
                  />
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25"
                  onClick={handleDeploy}
                  disabled={!projectName.trim() || isDeploying}
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Deploy to Vercel
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                  You&apos;ll be redirected to Vercel to complete the deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold">Simple process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Get your SaaS up and running in three simple steps.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-500/50 to-violet-500/50 hidden sm:block" />
                )}
                <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                  {item.step}
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

      {/* Features Grid */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
              Everything included
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              What You Get
            </p>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              A complete SaaS foundation with modern tech stack and best practices.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.gradient} transition-all group-hover:w-full`}
                />
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
              The latest tools and frameworks for building scalable applications.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'Next.js 16', color: 'bg-black text-white' },
              { name: 'React 19', color: 'bg-sky-500 text-white' },
              { name: 'TypeScript', color: 'bg-blue-600 text-white' },
              { name: 'Tailwind CSS 4', color: 'bg-cyan-500 text-white' },
              { name: 'shadcn/ui', color: 'bg-neutral-800 text-white' },
              { name: 'Supabase', color: 'bg-emerald-600 text-white' },
              { name: 'Stripe', color: 'bg-purple-600 text-white' },
              { name: 'PostHog', color: 'bg-orange-500 text-white' },
              { name: 'Resend', color: 'bg-neutral-900 text-white' },
              { name: 'Claude AI', color: 'bg-amber-600 text-white' },
            ].map((tech) => (
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

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-24 text-center shadow-2xl sm:px-16">
            <svg
              className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
              aria-hidden="true"
            >
              <defs>
                <pattern id="grid-deploy" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M.5 40V.5H40" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-deploy)" />
            </svg>

            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Deploy your SaaS in minutes. No complex setup, just your API keys.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 text-base font-semibold shadow-lg"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Deploy Now
              </Button>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Built with Next.js 16, React 19, Supabase, Stripe, and Claude AI.
        </p>
      </div>
    </div>
  )
}
