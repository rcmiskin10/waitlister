'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2, AlertTriangle } from 'lucide-react'
import { pricingConfig, getPlan, getPlanPrice } from '@/config/pricing'
import { useSubscription } from '@/hooks/use-subscription'
import { cn } from '@/lib/utils'

export default function BillingPage() {
  const { tier, status, isPaid, isLoading } = useSubscription()
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null)
  const [stripeReady, setStripeReady] = useState<boolean | null>(null)
  const [settingUp, setSettingUp] = useState(false)

  // Check if Stripe products are set up
  useEffect(() => {
    fetch('/api/setup/stripe')
      .then((r) => r.json())
      .then((data) => setStripeReady(data.complete))
      .catch(() => setStripeReady(false))
  }, [])

  const handleSetupStripe = async () => {
    setSettingUp(true)
    try {
      const response = await fetch('/api/setup/stripe', { method: 'POST' })
      const result = await response.json()

      if (result.error) {
        alert(result.error)
      } else if (result.errors?.length > 0) {
        alert(`Setup errors:\n${result.errors.map((e: any) => `${e.planId}: ${e.error}`).join('\n')}`)
      } else if (result.created?.length > 0) {
        setStripeReady(true)
      } else if (result.skipped?.length > 0) {
        // All plans already set up
        setStripeReady(true)
      }
    } catch {
      alert('Failed to set up Stripe products.')
    } finally {
      setSettingUp(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setUpgradingTo(planId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const { url, error } = await response.json()
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setUpgradingTo(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
      })

      const { url, error } = await response.json()
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch (error) {
      console.error('Billing portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentPlan = getPlan(tier)
  const currentPrice = getPlanPrice(tier)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Setup banner - shown when Stripe products haven't been created yet */}
      {stripeReady === false && (
        <Card className="border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Stripe billing not configured
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Click setup to automatically create Stripe products and prices from your pricing config.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSetupStripe}
              disabled={settingUp}
            >
              {settingUp ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Setup Billing'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the{' '}
            <span className="font-semibold text-foreground">
              {currentPlan.name}
            </span>{' '}
            plan.
            {status === 'canceled' && (
              <span className="text-yellow-600 ml-2">
                (Canceling at end of period)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPaid && (
            <Button variant="outline" onClick={handleManageBilling}>
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      <div className={cn(
        'grid gap-6',
        pricingConfig.plans.length === 1 && 'max-w-md mx-auto',
        pricingConfig.plans.length === 2 && 'md:grid-cols-2 max-w-3xl mx-auto',
        pricingConfig.plans.length >= 3 && 'md:grid-cols-2 lg:grid-cols-3',
      )}>
        {pricingConfig.plans.map((plan) => {
          const isCurrentPlan = tier === plan.id
          const planPrice = plan.price.monthly
          const canUpgrade = planPrice > currentPrice

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                plan.highlighted && 'border-primary shadow-lg',
                isCurrentPlan && 'ring-2 ring-primary'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                    Current
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-4xl font-bold">
                    ${planPrice}
                  </span>
                  {planPrice > 0 && (
                    <span className="text-muted-foreground">
                      /month
                    </span>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {canUpgrade ? (
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    disabled={upgradingTo === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {upgradingTo === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                ) : isCurrentPlan ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Free Tier
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
