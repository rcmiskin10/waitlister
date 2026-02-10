'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPlan, getLimits, isPaidTier, type PlanLimit } from '@/config/pricing'

interface SubscriptionState {
  tier: string
  status: string
  limits: PlanLimit
  isLoading: boolean
  isPaid: boolean
  canUse: (limitKey: string, currentCount: number) => boolean
}

export function useSubscription(): SubscriptionState {
  const [tier, setTier] = useState<string>('free')
  const [status, setStatus] = useState<string>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single() as { data: { subscription_tier: string | null; subscription_status: string } | null }

        if (profile) {
          setTier(profile.subscription_tier || 'free')
          setStatus(profile.subscription_status || 'free')
        }
      }
      setIsLoading(false)
    }

    fetchSubscription()
  }, [])

  const limits = getLimits(tier)

  return {
    tier,
    status,
    limits,
    isLoading,
    isPaid: isPaidTier(tier),
    canUse: (limitKey: string, currentCount: number) => {
      const limit = limits[limitKey]
      if (limit === undefined) return false
      if (limit === -1) return true
      return currentCount < limit
    },
  }
}
