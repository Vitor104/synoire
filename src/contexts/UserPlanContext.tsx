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
import {
  clearDevPlanTier,
  readDevPlanTier,
  writeDevPlanTier,
} from '@/lib/plan/devStorage'
import { hasGlowAccess, isPlanTier, type PlanTier } from '@/lib/plan/types'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

type UserPlanContextValue = {
  planTier: PlanTier
  isLoading: boolean
  hasGlowAccess: boolean
  setPlanTier: (tier: PlanTier) => void
  refreshPlanTier: (options?: { clearDevOverride?: boolean }) => Promise<void>
  paywallOpen: boolean
  paywallMessage: string | null
  openPaywall: (message?: string) => void
  closePaywall: () => void
}

const UserPlanContext = createContext<UserPlanContextValue | null>(null)

async function fetchPlanTierFromDb(): Promise<PlanTier> {
  const supabase = getSupabase()
  if (!isSupabaseConfigured || !supabase) return 'free'

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data, error } = await supabase
    .from('profiles')
    .select('plan_tier')
    .eq('id', user.id)
    .maybeSingle()

  if (!error && data?.plan_tier && isPlanTier(data.plan_tier)) {
    return data.plan_tier
  }
  return 'free'
}

export function UserPlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [planTier, setPlanTierState] = useState<PlanTier>(() => readDevPlanTier() ?? 'free')
  const [isLoading, setIsLoading] = useState(true)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallMessage, setPaywallMessage] = useState<string | null>(null)

  const refreshPlanTier = useCallback(
    async (options?: { clearDevOverride?: boolean }) => {
      if (options?.clearDevOverride) {
        clearDevPlanTier()
      }

      const devOverride = readDevPlanTier()
      if (devOverride && !options?.clearDevOverride) {
        setPlanTierState(devOverride)
        return
      }

      try {
        const tier = await fetchPlanTierFromDb()
        setPlanTierState(tier)
      } catch {
        setPlanTierState('free')
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function loadPlanTier() {
      const devOverride = readDevPlanTier()
      if (devOverride) {
        if (!cancelled) {
          setPlanTierState(devOverride)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)
      try {
        const tier = await fetchPlanTierFromDb()
        if (!cancelled) setPlanTierState(tier)
      } catch {
        if (!cancelled) setPlanTierState('free')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadPlanTier()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const setPlanTier = useCallback((tier: PlanTier) => {
    setPlanTierState(tier)
    writeDevPlanTier(tier)
  }, [])

  const openPaywall = useCallback((message?: string) => {
    setPaywallMessage(message ?? null)
    setPaywallOpen(true)
  }, [])
  const closePaywall = useCallback(() => {
    setPaywallOpen(false)
    setPaywallMessage(null)
  }, [])

  const value = useMemo(
    () => ({
      planTier,
      isLoading,
      hasGlowAccess: hasGlowAccess(planTier),
      setPlanTier,
      refreshPlanTier,
      paywallOpen,
      paywallMessage,
      openPaywall,
      closePaywall,
    }),
    [
      planTier,
      isLoading,
      setPlanTier,
      refreshPlanTier,
      paywallOpen,
      paywallMessage,
      openPaywall,
      closePaywall,
    ],
  )

  return <UserPlanContext.Provider value={value}>{children}</UserPlanContext.Provider>
}

export function useUserPlan(): UserPlanContextValue {
  const ctx = useContext(UserPlanContext)
  if (!ctx) {
    throw new Error('useUserPlan must be used within UserPlanProvider')
  }
  return ctx
}
