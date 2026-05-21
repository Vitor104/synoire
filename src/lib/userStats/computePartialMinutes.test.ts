import { describe, expect, it } from 'vitest'
import { computePartialMinutes } from './computePartialMinutes'

describe('computePartialMinutes', () => {
  it('returns 0 when join time is null', () => {
    expect(computePartialMinutes(null, 120_000)).toBe(0)
  })

  it('returns 0 for less than one minute', () => {
    const join = 0
    expect(computePartialMinutes(join, 59_999)).toBe(0)
  })

  it('floors whole minutes', () => {
    const join = 0
    expect(computePartialMinutes(join, 60_000)).toBe(1)
    expect(computePartialMinutes(join, 119_999)).toBe(1)
    expect(computePartialMinutes(join, 300_000)).toBe(5)
  })
})
