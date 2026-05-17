export type PlanTier = 'free' | 'glow' | 'collective'

const GLOW_TIERS: PlanTier[] = ['glow', 'collective']

export function hasGlowAccess(tier: PlanTier): boolean {
  return GLOW_TIERS.includes(tier)
}

export function isPlanTier(value: string): value is PlanTier {
  return value === 'free' || value === 'glow' || value === 'collective'
}
