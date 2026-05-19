import { describe, expect, it } from 'vitest'
import { buildPartnerLists } from './buildPartnerViews'
import {
  getPartnerUserId,
  mapPartnershipRow,
  mapPartnershipRows,
} from './mapPartnershipRow'
import type {
  MappedPartnership,
  PartnerProfileEnrichment,
  PartnershipRow,
} from './types'

const ME = 'user-me'
const PARTNER = 'user-partner'

function row(overrides: Partial<PartnershipRow>): PartnershipRow {
  return {
    id: 'ps-1',
    sender_id: ME,
    receiver_id: PARTNER,
    status: 'pending',
    created_at: '2026-05-18T12:00:00Z',
    ...overrides,
  }
}

function enrichment(
  userId: string,
  username: string,
): PartnerProfileEnrichment {
  return {
    id: userId,
    username,
    displayName: username,
    avatarUrl: '',
    currentStreak: 7,
  }
}

describe('mapPartnershipRow', () => {
  it('maps pending outgoing when current user is sender', () => {
    const mapped = mapPartnershipRow(row({ status: 'pending' }), ME)
    expect(mapped).toEqual({
      id: 'ps-1',
      partnerUserId: PARTNER,
      status: 'pending_outgoing',
      createdAt: '2026-05-18T12:00:00Z',
    })
  })

  it('maps pending incoming when current user is receiver', () => {
    const mapped = mapPartnershipRow(
      row({ sender_id: PARTNER, receiver_id: ME, status: 'pending' }),
      ME,
    )
    expect(mapped?.status).toBe('pending_incoming')
  })

  it('omits rejected rows', () => {
    expect(mapPartnershipRow(row({ status: 'rejected' }), ME)).toBeNull()
  })

  it('maps accepted', () => {
    const mapped = mapPartnershipRow(row({ status: 'accepted' }), ME)
    expect(mapped?.status).toBe('accepted')
  })
})

describe('mapPartnershipRows', () => {
  it('filters rejected', () => {
    const rows = mapPartnershipRows(
      [row({ status: 'rejected' }), row({ status: 'accepted' })],
      ME,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.status).toBe('accepted')
  })
})

describe('getPartnerUserId', () => {
  it('returns the other party', () => {
    expect(getPartnerUserId(row({}), ME)).toBe(PARTNER)
    expect(
      getPartnerUserId(row({ sender_id: PARTNER, receiver_id: ME }), ME),
    ).toBe(PARTNER)
  })
})

describe('buildPartnerLists', () => {
  const enrich = new Map<string, PartnerProfileEnrichment>([
    [PARTNER, enrichment(PARTNER, 'parceiro')],
    ['user-lucas', enrichment('user-lucas', 'lucas_pf')],
  ])

  it('splits accepted into online and offline', () => {
    const partnerships: MappedPartnership[] = [
      {
        id: 'ps-a',
        partnerUserId: PARTNER,
        status: 'accepted',
        createdAt: '2026-05-18T12:00:00Z',
      },
    ]
    const lists = buildPartnerLists(partnerships, enrich)
    expect(lists.acceptedPartners).toHaveLength(1)
    expect(lists.onlinePartners).toHaveLength(0)
    expect(lists.offlinePartners).toHaveLength(1)
  })

  it('separates incoming and outgoing invites', () => {
    const partnerships: MappedPartnership[] = [
      {
        id: 'ps-in',
        partnerUserId: PARTNER,
        status: 'pending_incoming',
        createdAt: '2026-05-18T12:00:00Z',
      },
      {
        id: 'ps-out',
        partnerUserId: 'user-lucas',
        status: 'pending_outgoing',
        createdAt: '2026-05-18T12:00:00Z',
      },
    ]
    const lists = buildPartnerLists(partnerships, enrich)
    expect(lists.incomingInvites).toHaveLength(1)
    expect(lists.outgoingInvites).toHaveLength(1)
  })

  it('moves partner to accepted after accept mapping', () => {
    const partnerships: MappedPartnership[] = [
      {
        id: 'ps-in',
        partnerUserId: PARTNER,
        status: 'accepted',
        createdAt: '2026-05-18T12:00:00Z',
      },
    ]
    const lists = buildPartnerLists(partnerships, enrich)
    expect(lists.incomingInvites).toHaveLength(0)
    expect(lists.acceptedPartners.find((p) => p.partnershipId === 'ps-in')).toBeDefined()
  })
})
