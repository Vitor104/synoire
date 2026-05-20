import type { PlanTier } from './types'
import { isPlanTier } from './types'

export const DEV_PLAN_TIER_KEY = 'synoire_dev_plan_tier'

export function readDevPlanTier(): PlanTier | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(DEV_PLAN_TIER_KEY)
    if (raw && isPlanTier(raw)) return raw
  } catch {
    // private mode
  }
  return null
}

export function writeDevPlanTier(tier: PlanTier): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(DEV_PLAN_TIER_KEY, tier)
  } catch {
    // quota or private mode
  }
}

export function clearDevPlanTier(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(DEV_PLAN_TIER_KEY)
  } catch {
    // private mode
  }
}
