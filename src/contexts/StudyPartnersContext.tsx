import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  acceptPartnership,
  buildPartnerLists,
  declinePartnership,
  readPartnerships,
  sendPartnerInvite,
  type PartnerLists,
  type SendInviteResult,
} from '@/lib/studyPartners'

type StudyPartnersContextValue = PartnerLists & {
  sendPartnerInvite: (username: string) => SendInviteResult
  acceptInvite: (partnershipId: string) => void
  declineInvite: (partnershipId: string) => void
  refresh: () => void
}

const StudyPartnersContext = createContext<StudyPartnersContextValue | null>(null)

export function StudyPartnersProvider({ children }: { children: ReactNode }) {
  const [partnerships, setPartnerships] = useState(() => readPartnerships())

  const refresh = useCallback(() => {
    setPartnerships(readPartnerships())
  }, [])

  const lists = useMemo(() => buildPartnerLists(partnerships), [partnerships])

  const sendInvite = useCallback((username: string): SendInviteResult => {
    const result = sendPartnerInvite(username)
    if (result.ok) {
      setPartnerships(readPartnerships())
    }
    return result
  }, [])

  const acceptInvite = useCallback((partnershipId: string) => {
    setPartnerships(acceptPartnership(partnershipId))
  }, [])

  const declineInvite = useCallback((partnershipId: string) => {
    setPartnerships(declinePartnership(partnershipId))
  }, [])

  const value = useMemo(
    () => ({
      ...lists,
      sendPartnerInvite: sendInvite,
      acceptInvite,
      declineInvite,
      refresh,
    }),
    [lists, sendInvite, acceptInvite, declineInvite, refresh],
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
