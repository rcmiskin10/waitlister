import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setupStripeProducts, isStripeSetupComplete } from '@/lib/stripe/setup'

// POST /api/setup/stripe — auto-create Stripe products from config
export async function POST() {
  try {
    // Require authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not set. Add it to your environment variables.' },
        { status: 500 }
      )
    }

    const result = await setupStripeProducts()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Stripe setup error:', error)
    return NextResponse.json({ error: 'Failed to set up Stripe products' }, { status: 500 })
  }
}

// GET /api/setup/stripe — check if setup is complete
export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ complete: false, reason: 'STRIPE_SECRET_KEY not set' })
    }

    const complete = await isStripeSetupComplete()
    return NextResponse.json({ complete })
  } catch {
    return NextResponse.json({ complete: false, reason: 'Error checking setup status' })
  }
}
