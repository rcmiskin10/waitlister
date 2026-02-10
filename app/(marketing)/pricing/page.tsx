import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pricingConfig } from '@/config/pricing'

const { plans: configPlans } = pricingConfig

const plans = configPlans.map((plan) => ({
  name: plan.name,
  description: plan.description,
  price: plan.price.monthly,
  interval: plan.price.monthly > 0 ? 'month' : null,
  features: plan.features,
  cta: plan.cta,
  href: plan.price.monthly === 0 ? '/signup' : `/signup?plan=${plan.id}`,
  highlighted: plan.highlighted || false,
}))

const faqs = [
  {
    question: 'Can I try before I buy?',
    answer:
      'Yes! The Free tier lets you explore the platform with limited features. Pro tier comes with a 14-day free trial.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards through Stripe. For Team plans, we also offer invoice billing.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer:
      "Your data is always yours. If you downgrade, you'll keep read access to all your content, but creation will be limited to your new plan's limits.",
  },
]

export default function PricingPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Simple pricing
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl dark:text-white">
              Simple,
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {' '}Transparent{' '}
              </span>
              Pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400 sm:text-xl">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={cn(
              'mx-auto grid gap-8',
              plans.length === 1 && 'max-w-md',
              plans.length === 2 && 'max-w-3xl lg:grid-cols-2',
              plans.length >= 3 && 'max-w-5xl lg:grid-cols-3',
            )}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative flex flex-col overflow-hidden rounded-3xl border bg-white p-8 shadow-sm transition-all dark:bg-neutral-900',
                  plan.highlighted
                    ? 'border-violet-500 shadow-xl shadow-violet-500/10 scale-105 z-10'
                    : 'border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:-translate-y-1'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
                )}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-neutral-900 dark:text-white">${plan.price}</span>
                  {plan.interval && (
                    <span className="text-neutral-600 dark:text-neutral-400">/{plan.interval}</span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                        plan.highlighted ? 'bg-violet-100 dark:bg-violet-900/50' : 'bg-neutral-100 dark:bg-neutral-800'
                      )}>
                        <Check className={cn(
                          'h-3 w-3',
                          plan.highlighted ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-600 dark:text-neutral-400'
                        )} />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className={cn(
                      'w-full h-12 text-base font-semibold',
                      plan.highlighted
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25'
                        : ''
                    )}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{faq.question}</h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-24 text-center shadow-2xl sm:px-16">
            <svg
              className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
              aria-hidden="true"
            >
              <defs>
                <pattern id="grid-pricing" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M.5 40V.5H40" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pricing)" />
            </svg>

            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Still have questions?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-emerald-100">
              We&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="mt-10">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold shadow-lg">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
