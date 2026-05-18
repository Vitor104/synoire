export const STUDY_PARTNERSHIPS_STORAGE_KEY = 'synoire_study_partnerships'

export type PartnershipStatus =
  | 'pending_incoming'
  | 'pending_outgoing'
  | 'accepted'
  | 'declined'

export type StoredPartnership = {
  id: string
  partnerUserId: string
  status: PartnershipStatus
  createdAt: string
}

export type MockUserProfile = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  currentStreak: number
  isOnline: boolean
  currentRoomLabel: string | null
  currentRoomId: string | null
}

export type StudyPartnerView = {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  currentStreak: number
  isOnline: boolean
  currentRoomLabel: string | null
  currentRoomId: string | null
  partnershipStatus: PartnershipStatus
  partnershipId: string
}

export type PartnerLists = {
  acceptedPartners: StudyPartnerView[]
  onlinePartners: StudyPartnerView[]
  offlinePartners: StudyPartnerView[]
  incomingInvites: StudyPartnerView[]
  outgoingInvites: StudyPartnerView[]
}
