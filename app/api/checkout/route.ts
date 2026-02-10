import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCustomer, createCheckoutSession } from '@/lib/stripe/server'
import { getPlan } from '@/config/pricing'
import { getStripePriceId } from '@/lib/stripe/setup'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { planId } = await request.json() as { planId: string }

    if (!planId) {
      return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 })
    }

    const plan = getPlan(planId)
    if (!plan || plan.price.monthly === 0) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Resolve price ID: env var → DB → error
    const priceId = await getStripePriceId(planId)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe products not set up. Go to Admin > Setup to configure billing.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: { stripe_customer_id: string | null } | null }

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      customerId = await createCustomer(user.email!, user.user_metadata?.full_name)

      const adminSupabase = createAdminClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminSupabase.from('profiles') as any)
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    const checkoutUrl = await createCheckoutSession(
      customerId,
      priceId,
      `${origin}/dashboard?checkout=success`,
      `${origin}/billing?checkout=canceled`
    )

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
