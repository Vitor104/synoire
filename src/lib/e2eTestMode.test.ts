import { afterEach, describe, expect, it, vi } from 'vitest'

describe('e2eTestMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses 1s segments and 25 min recording when VITE_E2E_TEST_MODE is true', async () => {
    vi.stubEnv('VITE_E2E_TEST_MODE', 'true')
    const mod = await import('./e2eTestMode')
    expect(mod.isE2eTestMode).toBe(true)
    expect(mod.getEffectiveCycleDurations(1500, 300)).toEqual({
      focusSec: 1,
      breakSec: 1,
    })
    expect(mod.getEffectivePrepSeconds()).toBe(0)
    expect(mod.getFocusMinutesForSessionRecord('25/5')).toBe(25)
  })

  it('uses real durations when E2E mode is off', async () => {
    vi.stubEnv('VITE_E2E_TEST_MODE', 'false')
    const mod = await import('./e2eTestMode')
    expect(mod.isE2eTestMode).toBe(false)
    expect(mod.getEffectiveCycleDurations(1500, 300)).toEqual({
      focusSec: 1500,
      breakSec: 300,
    })
    expect(mod.getEffectivePrepSeconds()).toBe(60)
    expect(mod.getFocusMinutesForSessionRecord('25/5')).toBe(25)
  })
})
