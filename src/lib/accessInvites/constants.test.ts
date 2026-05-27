import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACCESS_INVITE_COOLDOWN_MS,
  filterPendingGrantsForInviter,
  getHubInviterButtonState,
  getRoomInviterButtonState,
  isAccessGrantActive,
  isAccessInvitePending,
} from './constants'

describe('accessInvites constants', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-27T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('treats fresh grants as pending and active', () => {
    const grantedAt = new Date(Date.now() - 60_000).toISOString()
    expect(isAccessInvitePending(grantedAt)).toBe(true)
    expect(isAccessGrantActive(grantedAt)).toBe(true)
  })

  it('expires pending grants after cooldown', () => {
    const grantedAt = new Date(Date.now() - ACCESS_INVITE_COOLDOWN_MS - 1).toISOString()
    expect(isAccessInvitePending(grantedAt)).toBe(false)
    expect(isAccessGrantActive(grantedAt)).toBe(false)
  })

  it('keeps accepted grants active after cooldown', () => {
    const grantedAt = new Date(Date.now() - ACCESS_INVITE_COOLDOWN_MS - 1).toISOString()
    const acceptedAt = new Date(Date.now() - 60_000).toISOString()
    expect(isAccessInvitePending(grantedAt, acceptedAt)).toBe(false)
    expect(isAccessGrantActive(grantedAt, acceptedAt)).toBe(true)
  })

  it('getRoomInviterButtonState reflects pending, accepted, and re-send', () => {
    const fresh = new Date(Date.now() - 60_000).toISOString()
    const stale = new Date(Date.now() - ACCESS_INVITE_COOLDOWN_MS - 1).toISOString()

    expect(getRoomInviterButtonState()).toEqual({ disabled: false, label: 'Enviar Convite' })
    expect(getRoomInviterButtonState({ grantedAt: fresh })).toEqual({
      disabled: true,
      label: 'Enviado',
    })
    expect(getRoomInviterButtonState({ grantedAt: stale })).toEqual({
      disabled: false,
      label: 'Reenviar convite',
    })
    expect(getRoomInviterButtonState({ grantedAt: stale, acceptedAt: fresh })).toEqual({
      disabled: true,
      label: 'Aceito',
    })
    expect(getHubInviterButtonState({ grantedAt: fresh })).toEqual({
      disabled: true,
      label: 'Convidado',
    })
    expect(getHubInviterButtonState({ grantedAt: stale })).toEqual({
      disabled: false,
      label: 'Convidar para o Hub',
    })
  })

  it('filterPendingGrantsForInviter keeps only blocking invites', () => {
    const fresh = new Date(Date.now() - 60_000).toISOString()
    const stale = new Date(Date.now() - ACCESS_INVITE_COOLDOWN_MS - 1).toISOString()
    const grants = [
      { userId: 'a', grantedAt: fresh },
      { userId: 'b', grantedAt: stale },
      { userId: 'c', grantedAt: stale, acceptedAt: fresh },
    ]
    expect(filterPendingGrantsForInviter(grants)).toEqual([grants[0]])
  })
})
