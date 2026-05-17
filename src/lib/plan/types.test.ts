import { describe, expect, it } from 'vitest'
import { hasGlowAccess, isPlanTier } from './types'

describe('hasGlowAccess', () => {
  it('returns false for free', () => {
    expect(hasGlowAccess('free')).toBe(false)
  })

  it('returns true for glow and collective', () => {
    expect(hasGlowAccess('glow')).toBe(true)
    expect(hasGlowAccess('collective')).toBe(true)
  })
})

describe('isPlanTier', () => {
  it('validates known tiers', () => {
    expect(isPlanTier('free')).toBe(true)
    expect(isPlanTier('glow')).toBe(true)
    expect(isPlanTier('collective')).toBe(true)
    expect(isPlanTier('pro')).toBe(false)
  })
})
