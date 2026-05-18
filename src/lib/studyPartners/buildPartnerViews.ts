import { findProfileById, MOCK_USER_PROFILES } from './mockProfiles'
import type {
  PartnerLists,
  StoredPartnership,
  StudyPartnerView,
} from './types'

function toView(
  partnership: StoredPartnership,
): StudyPartnerView | null {
  const profile = findProfileById(partnership.partnerUserId)
  if (!profile) return null

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    currentStreak: profile.currentStreak,
    isOnline: profile.isOnline,
    currentRoomLabel: profile.currentRoomLabel,
    currentRoomId: profile.currentRoomId,
    partnershipStatus: partnership.status,
    partnershipId: partnership.id,
  }
}

export function buildPartnerLists(partnerships: StoredPartnership[]): PartnerLists {
  const views = partnerships
    .map(toView)
    .filter((v): v is StudyPartnerView => v !== null)

  const acceptedPartners = views.filter((v) => v.partnershipStatus === 'accepted')
  const onlinePartners = acceptedPartners.filter((v) => v.isOnline)
  const offlinePartners = acceptedPartners.filter((v) => !v.isOnline)
  const incomingInvites = views.filter((v) => v.partnershipStatus === 'pending_incoming')
  const outgoingInvites = views.filter((v) => v.partnershipStatus === 'pending_outgoing')

  return {
    acceptedPartners,
    onlinePartners,
    offlinePartners,
    incomingInvites,
    outgoingInvites,
  }
}

export function getMockCatalogUsernames(): string[] {
  return MOCK_USER_PROFILES.map((p) => p.username)
}
