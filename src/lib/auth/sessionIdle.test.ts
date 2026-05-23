import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearLastActivity,
  getLastActivityAt,
  isIdleExpired,
  LAST_ACTIVITY_STORAGE_KEY,
  SESSION_IDLE_MS,
  touchLastActivity,
} from './sessionIdle'

describe('sessionIdle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('isIdleExpired is false when activity is recent', () => {
    const now = 1_700_000_000_000
    touchLastActivity(now)
    expect(isIdleExpired(now + SESSION_IDLE_MS - 1)).toBe(false)
  })

  it('isIdleExpired is true when idle window elapsed', () => {
    const now = 1_700_000_000_000
    touchLastActivity(now)
    expect(isIdleExpired(now + SESSION_IDLE_MS)).toBe(true)
  })

  it('isIdleExpired is false when no activity recorded', () => {
    expect(isIdleExpired()).toBe(false)
  })

  it('clearLastActivity removes the storage key', () => {
    touchLastActivity()
    expect(getLastActivityAt()).not.toBeNull()
    clearLastActivity()
    expect(localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)).toBeNull()
    expect(getLastActivityAt()).toBeNull()
  })
})
