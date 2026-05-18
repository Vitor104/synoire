import { findProfileByUsername } from './mockProfiles'
import { getSeedPartnerships } from './seedPartnerships'
import {
  STUDY_PARTNERSHIPS_STORAGE_KEY,
  type StoredPartnership,
} from './types'

function newPartnershipId(): string {
  return `ps-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function readPartnerships(): StoredPartnership[] {
  if (typeof localStorage === 'undefined') return getSeedPartnerships()
  try {
    const raw = localStorage.getItem(STUDY_PARTNERSHIPS_STORAGE_KEY)
    if (!raw) {
      const seed = getSeedPartnerships()
      writePartnerships(seed)
      return seed
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return getSeedPartnerships()
    return parsed.filter(isValidPartnership)
  } catch {
    return getSeedPartnerships()
  }
}

export function writePartnerships(partnerships: StoredPartnership[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STUDY_PARTNERSHIPS_STORAGE_KEY, JSON.stringify(partnerships))
  } catch {
    // quota or private mode
  }
}

function isValidPartnership(item: unknown): item is StoredPartnership {
  if (!item || typeof item !== 'object') return false
  const p = item as StoredPartnership
  return (
    typeof p.id === 'string' &&
    typeof p.partnerUserId === 'string' &&
    typeof p.status === 'string' &&
    typeof p.createdAt === 'string'
  )
}

function existingForUser(
  partnerships: StoredPartnership[],
  partnerUserId: string,
): StoredPartnership | undefined {
  return partnerships.find((p) => p.partnerUserId === partnerUserId)
}

export type SendInviteResult =
  | { ok: true; partnership: StoredPartnership }
  | { ok: false; error: 'not_found' | 'already_exists' | 'invalid_username' }

export function sendPartnerInvite(username: string): SendInviteResult {
  const profile = findProfileByUsername(username)
  if (!profile) {
    return { ok: false, error: 'not_found' }
  }

  const normalized = username.trim().replace(/^@/, '')
  if (normalized.length < 2) {
    return { ok: false, error: 'invalid_username' }
  }

  const partnerships = readPartnerships()
  const existing = existingForUser(partnerships, profile.id)
  if (existing && existing.status !== 'declined') {
    return { ok: false, error: 'already_exists' }
  }

  const partnership: StoredPartnership = {
    id: newPartnershipId(),
    partnerUserId: profile.id,
    status: 'pending_outgoing',
    createdAt: new Date().toISOString(),
  }

  const withoutDeclined = partnerships.filter(
    (p) => p.partnerUserId !== profile.id || p.status !== 'declined',
  )
  writePartnerships([...withoutDeclined, partnership])
  return { ok: true, partnership }
}

export function acceptPartnership(partnershipId: string): StoredPartnership[] {
  const partnerships = readPartnerships()
  const next = partnerships.map((p) =>
    p.id === partnershipId && p.status === 'pending_incoming'
      ? { ...p, status: 'accepted' as const }
      : p,
  )
  writePartnerships(next)
  return next
}

export function declinePartnership(partnershipId: string): StoredPartnership[] {
  const partnerships = readPartnerships()
  const next = partnerships.map((p) =>
    p.id === partnershipId && p.status === 'pending_incoming'
      ? { ...p, status: 'declined' as const }
      : p,
  )
  writePartnerships(next)
  return next
}
