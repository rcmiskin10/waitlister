import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolvePlanIdByPriceId } from '@/lib/stripe/setup'
import { sendSubscriptionConfirmedEmail } from '@/lib/resend/send-emails'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.customer && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          const priceId = subscription.items.data[0]?.price.id
          const tier = priceId ? await resolvePlanIdByPriceId(priceId) : null

          // Update profile with subscription info
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('profiles') as any)
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: 'active',
              subscription_tier: tier || 'pro',
            })
            .eq('stripe_customer_id', session.customer as string)

          // Send subscription confirmation email (non-blocking)
          if (session.customer_email) {
            const priceData = subscription.items.data[0]?.price
            const amount = priceData?.unit_amount ? (priceData.unit_amount / 100) : 0
            sendSubscriptionConfirmedEmail(session.customer_email, {
              userName: session.customer_email.split('@')[0],
              planName: (tier as string) || 'Pro',
              price: amount,
              interval: priceData?.recurring?.interval === 'year' ? 'year' : 'month',
            }).catch((err) => console.error('Failed to send subscription email:', err))
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const tier = priceId ? await resolvePlanIdByPriceId(priceId) : null

        let status: string
        if (subscription.cancel_at_period_end) {
          status = 'canceled'
        } else if (subscription.status === 'active') {
          status = 'active'
        } else if (subscription.status === 'trialing') {
          status = 'trialing'
        } else if (subscription.status === 'past_due') {
          status = 'past_due'
        } else {
          status = subscription.status
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any)
          .update({
            subscription_status: status,
            subscription_tier: tier,
          })
          .eq('stripe_customer_id', subscription.customer as string)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any)
          .update({
            subscription_status: 'free',
            subscription_tier: null,
          })
          .eq('stripe_customer_id', subscription.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.customer) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('profiles') as any)
            .update({
              subscription_status: 'past_due',
            })
            .eq('stripe_customer_id', invoice.customer as string)
        }
        break
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
