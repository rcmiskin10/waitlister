import { stripe } from './server'
import { pricingConfig } from '@/config/pricing'
import { createAdminClient } from '@/lib/supabase/admin'
import { siteConfig } from '@/config/site'

interface SetupResult {
  created: Array<{ planId: string; productId: string; priceId: string }>
  skipped: string[]
  errors: Array<{ planId: string; error: string }>
}

/**
 * Auto-creates Stripe products and prices from config/pricing.ts.
 * Skips plans that already exist in the stripe_products table.
 * Called once on first boot or via admin setup.
 */
export async function setupStripeProducts(): Promise<SetupResult> {
  const supabase = createAdminClient()
  const result: SetupResult = { created: [], skipped: [], errors: [] }

  // Get already-created products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('stripe_products')
    .select('plan_id')

  const existingPlanIds = new Set((existing || []).map((r: any) => r.plan_id))

  // Only create products for paid plans
  const paidPlans = pricingConfig.plans.filter((p) => p.price.monthly > 0)

  for (const plan of paidPlans) {
    if (existingPlanIds.has(plan.id)) {
      result.skipped.push(plan.id)
      continue
    }

    try {
      // Create Stripe product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          plan_id: plan.id,
          source: siteConfig.name,
        },
      })

      // Create monthly price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price.monthly * 100),
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan_id: plan.id },
      })

      // Optionally create yearly price
      let yearlyPriceId: string | undefined
      if (plan.price.yearly) {
        const yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.price.yearly * 100),
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: { plan_id: plan.id },
        })
        yearlyPriceId = yearlyPrice.id
      }

      // Store in database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('stripe_products')
        .insert({
          plan_id: plan.id,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          stripe_yearly_price_id: yearlyPriceId || null,
          price_amount: Math.round(plan.price.monthly * 100),
          price_interval: 'month',
        })

      result.created.push({
        planId: plan.id,
        productId: product.id,
        priceId: price.id,
      })
    } catch (err) {
      const error = err as Error
      result.errors.push({ planId: plan.id, error: error.message })
    }
  }

  return result
}

/**
 * Get the Stripe price ID for a plan.
 * Checks DB first (auto-created), falls back to env var, returns null if neither.
 */
export async function getStripePriceId(planId: string): Promise<string | null> {
  // 1. Check env var first (manual override always wins)
  const plan = pricingConfig.plans.find((p) => p.id === planId)
  if (plan?.priceId) return plan.priceId

  // 2. Check database (auto-created)
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('stripe_products')
    .select('stripe_price_id')
    .eq('plan_id', planId)
    .single()

  return data?.stripe_price_id || null
}

/**
 * Resolve a Stripe price ID to a plan ID.
 * Checks config (env vars) first, then DB (auto-created).
 * Used by the webhook handler.
 */
export async function resolvePlanIdByPriceId(priceId: string): Promise<string | null> {
  // 1. Check config (env var-based)
  const fromConfig = pricingConfig.plans.find(
    (p) => p.priceId === priceId || p.yearlyPriceId === priceId
  )
  if (fromConfig) return fromConfig.id

  // 2. Check database (auto-created)
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('stripe_products')
    .select('plan_id')
    .or(`stripe_price_id.eq.${priceId},stripe_yearly_price_id.eq.${priceId}`)
    .single()

  return data?.plan_id || null
}

/**
 * Check if Stripe products have been set up for all paid plans.
 */
export async function isStripeSetupComplete(): Promise<boolean> {
  const paidPlans = pricingConfig.plans.filter((p) => p.price.monthly > 0)
  if (paidPlans.length === 0) return true

  for (const plan of paidPlans) {
    const priceId = await getStripePriceId(plan.id)
    if (!priceId) return false
  }
  return true
}
