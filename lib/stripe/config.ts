// Re-exports from the canonical pricing config.
// This file exists so existing imports from '@/lib/stripe/config' keep working.

export {
  pricingConfig,
  type Plan,
  type PlanLimit,
  getPlan,
  getPlanByPriceId,
  getLimits,
  checkLimit,
  isPaidTier,
  getFreePlan,
  getPaidPlans,
  getHighlightedPlan,
  getPlanPrice,
} from '@/config/pricing'
