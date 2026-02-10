import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: { stripe_customer_id: string | null } | null }

    const stripeCustomerId = profile?.stripe_customer_id
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
    }

    // Create billing portal session
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    const portalUrl = await createBillingPortalSession(
      stripeCustomerId,
      `${origin}/billing`
    )

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}
