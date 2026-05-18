import { beforeEach, describe, expect, it } from 'vitest'
import { buildPartnerLists } from './buildPartnerViews'
import { findProfileByUsername } from './mockProfiles'
import {
  acceptPartnership,
  readPartnerships,
  sendPartnerInvite,
  writePartnerships,
} from './storage'
import { STUDY_PARTNERSHIPS_STORAGE_KEY } from './types'

beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STUDY_PARTNERSHIPS_STORAGE_KEY)
  }
})

describe('buildPartnerLists', () => {
  it('splits accepted partners into online and offline', () => {
    const partnerships = readPartnerships()
    const lists = buildPartnerLists(partnerships)

    expect(lists.acceptedPartners.length).toBeGreaterThanOrEqual(2)
    expect(lists.onlinePartners.every((p) => p.isOnline)).toBe(true)
    expect(lists.offlinePartners.every((p) => !p.isOnline)).toBe(true)
    expect(lists.incomingInvites.some((p) => p.partnershipStatus === 'pending_incoming')).toBe(
      true,
    )
  })

  it('moves partner to accepted list after accept', () => {
    const partnerships = readPartnerships()
    const incoming = partnerships.find((p) => p.status === 'pending_incoming')
    expect(incoming).toBeDefined()

    const next = acceptPartnership(incoming!.id)
    const lists = buildPartnerLists(next)

    expect(lists.incomingInvites.find((p) => p.partnershipId === incoming!.id)).toBeUndefined()
    expect(
      lists.acceptedPartners.find((p) => p.partnershipId === incoming!.id),
    ).toBeDefined()
  })
})

describe('sendPartnerInvite', () => {
  it('creates pending_outgoing for known username', () => {
    const result = sendPartnerInvite('lucas_pf')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const lists = buildPartnerLists(readPartnerships())
    expect(
      lists.outgoingInvites.some((p) => p.username === 'lucas_pf'),
    ).toBe(true)
  })

  it('rejects unknown username', () => {
    const result = sendPartnerInvite('usuario_inexistente_xyz')
    expect(result).toEqual({ ok: false, error: 'not_found' })
  })
})

describe('findProfileByUsername', () => {
  it('normalizes @ prefix', () => {
    expect(findProfileByUsername('@vitor')?.username).toBe('vitor')
  })
})

describe('writePartnerships', () => {
  it('persists custom state', () => {
    writePartnerships([])
    expect(readPartnerships()).toEqual([])
  })
})
