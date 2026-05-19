import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePartnerPresence } from '@/hooks/usePartnerPresence'
import {
  buildPartnerLists,
  fetchPartnerEnrichment,
  listPartnerships,
  sendPartnerInvite as sendPartnerInviteLib,
  updatePartnershipStatus,
  type MappedPartnership,
  type PartnerLists,
  type PartnerProfileEnrichment,
  type SendInviteResult,
} from '@/lib/studyPartners'

type StudyPartnersContextValue = PartnerLists & {
  isLoading: boolean
  error: string | null
  sendPartnerInvite: (username: string) => Promise<SendInviteResult>
  acceptInvite: (partnershipId: string) => Promise<void>
  declineInvite: (partnershipId: string) => Promise<void>
  refresh: () => Promise<void>
}

const StudyPartnersContext = createContext<StudyPartnersContextValue | null>(null)

export function StudyPartnersProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [partnerships, setPartnerships] = useState<MappedPartnership[]>([])
  const [enrichment, setEnrichment] = useState(
    () => new Map<string, PartnerProfileEnrichment>(),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const partnerUserIds = useMemo(
    () => partnerships.map((p) => p.partnerUserId),
    [partnerships],
  )
  const presence = usePartnerPresence(partnerUserIds)

  const lists = useMemo(
    () => buildPartnerLists(partnerships, enrichment, presence),
    [partnerships, enrichment, presence],
  )

  const refresh = useCallback(async () => {
    const userId = user?.id
    if (!userId) {
      setPartnerships([])
      setEnrichment(new Map())
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const partnershipsResult = await listPartnerships(userId)
    if (!partnershipsResult.ok) {
      setPartnerships([])
      setEnrichment(new Map())
      setError(partnershipsResult.message)
      setIsLoading(false)
      return
    }

    setPartnerships(partnershipsResult.data)
    const partnerIds = partnershipsResult.data.map((p) => p.partnerUserId)
    setEnrichment(await fetchPartnerEnrichment(partnerIds))
    setError(null)
    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    if (authLoading) return
    void refresh()
  }, [authLoading, refresh])

  const sendInvite = useCallback(
    async (username: string): Promise<SendInviteResult> => {
      const userId = user?.id
      if (!userId) {
        return { ok: false, error: 'invalid_username' }
      }

      const result = await sendPartnerInviteLib(userId, username)
      if (result.ok) {
        await refresh()
      }
      return result
    },
    [user?.id, refresh],
  )

  const acceptInvite = useCallback(
    async (partnershipId: string) => {
      const update = await updatePartnershipStatus(partnershipId, 'accepted')
      if (update.ok) {
        await refresh()
      }
    },
    [refresh],
  )

  const declineInvite = useCallback(
    async (partnershipId: string) => {
      const update = await updatePartnershipStatus(partnershipId, 'rejected')
      if (update.ok) {
        await refresh()
      }
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      ...lists,
      isLoading: authLoading || isLoading,
      error,
      sendPartnerInvite: sendInvite,
      acceptInvite,
      declineInvite,
      refresh,
    }),
    [lists, authLoading, isLoading, error, sendInvite, acceptInvite, declineInvite, refresh],
  )

  return (
    <StudyPartnersContext.Provider value={value}>{children}</StudyPartnersContext.Provider>
  )
}

export function useStudyPartners(): StudyPartnersContextValue {
  const ctx = useContext(StudyPartnersContext)
  if (!ctx) {
    throw new Error('useStudyPartners must be used within StudyPartnersProvider')
  }
  return ctx
}
