import type {
  MappedPartnership,
  PartnerLists,
  PartnerPresenceEntry,
  PartnerProfileEnrichment,
  StudyPartnerView,
} from './types'

function toView(
  partnership: MappedPartnership,
  enrichment: Map<string, PartnerProfileEnrichment>,
  presence: Map<string, PartnerPresenceEntry>,
): StudyPartnerView | null {
  const profile = enrichment.get(partnership.partnerUserId)
  if (!profile) return null

  const presenceEntry = presence.get(partnership.partnerUserId)

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    currentStreak: profile.currentStreak,
    isOnline: presenceEntry?.isOnline ?? false,
    currentRoomLabel: presenceEntry?.roomLabel ?? null,
    currentRoomId: presenceEntry?.roomId ?? null,
    partnershipStatus: partnership.status,
    partnershipId: partnership.id,
  }
}

export function buildPartnerLists(
  partnerships: MappedPartnership[],
  enrichment: Map<string, PartnerProfileEnrichment>,
  presence: Map<string, PartnerPresenceEntry> = new Map(),
): PartnerLists {
  const views = partnerships
    .map((p) => toView(p, enrichment, presence))
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
