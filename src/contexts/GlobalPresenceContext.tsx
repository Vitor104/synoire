import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isDemoMode } from '@/lib/studyPartners/demo'
import {
  GLOBAL_PRESENCE_CHANNEL,
  parseGlobalPresenceState,
  type GlobalPresencePayload,
} from '@/lib/presence/globalPresence'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

type GlobalPresenceContextValue = {
  presenceByUserId: Map<string, GlobalPresencePayload>
  /** Bumps on every presence sync so consumers re-render reliably. */
  presenceVersion: number
  trackPresence: (payload: Omit<GlobalPresencePayload, 'user_id'>) => void
}

const GlobalPresenceContext = createContext<GlobalPresenceContextValue | null>(null)

export function GlobalPresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [presenceByUserId, setPresenceByUserId] = useState(
    () => new Map<string, GlobalPresencePayload>(),
  )
  const [presenceVersion, setPresenceVersion] = useState(0)
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null>(
    null,
  )
  const subscribedRef = useRef(false)
  const pendingTrackRef = useRef<Omit<GlobalPresencePayload, 'user_id'> | null>(null)

  const applyPresenceState = useCallback(() => {
    const channel = channelRef.current
    if (!channel) return
    const state = channel.presenceState() as Record<string, unknown[]>
    setPresenceByUserId(parseGlobalPresenceState(state))
    setPresenceVersion((v) => v + 1)
  }, [])

  const schedulePresenceSync = useCallback(() => {
    queueMicrotask(() => {
      applyPresenceState()
    })
  }, [applyPresenceState])

  const trackPresence = useCallback(
    (payload: Omit<GlobalPresencePayload, 'user_id'>) => {
      if (!user?.id) return
      pendingTrackRef.current = payload
      const channel = channelRef.current
      if (!channel || !subscribedRef.current) return
      void channel
        .track({
          user_id: user.id,
          ...payload,
        })
        .then(() => {
          schedulePresenceSync()
        })
    },
    [user?.id, schedulePresenceSync],
  )

  useEffect(() => {
    if (!user?.id || isDemoMode || !isSupabaseConfigured) {
      setPresenceByUserId(new Map())
      setPresenceVersion(0)
      channelRef.current = null
      subscribedRef.current = false
      pendingTrackRef.current = null
      return
    }

    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase.channel(GLOBAL_PRESENCE_CHANNEL, {
      config: { presence: { key: user.id } },
    })
    channelRef.current = channel
    subscribedRef.current = false

    channel
      .on('presence', { event: 'sync' }, schedulePresenceSync)
      .on('presence', { event: 'join' }, schedulePresenceSync)
      .on('presence', { event: 'leave' }, schedulePresenceSync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          subscribedRef.current = true
          const pending = pendingTrackRef.current
          if (pending) {
            await channel.track({
              user_id: user.id,
              ...pending,
            })
          }
          applyPresenceState()
        }
      })

    const onUnload = () => {
      void channel.untrack()
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('beforeunload', onUnload)
      subscribedRef.current = false
      pendingTrackRef.current = null
      void channel.untrack()
      void supabase.removeChannel(channel)
      channelRef.current = null
      setPresenceByUserId(new Map())
      setPresenceVersion(0)
    }
  }, [user?.id, applyPresenceState, schedulePresenceSync])

  const value = useMemo(
    (): GlobalPresenceContextValue => ({
      presenceByUserId,
      presenceVersion,
      trackPresence,
    }),
    [presenceByUserId, presenceVersion, trackPresence],
  )

  return (
    <GlobalPresenceContext.Provider value={value}>{children}</GlobalPresenceContext.Provider>
  )
}

export function useGlobalPresence(): GlobalPresenceContextValue {
  const ctx = useContext(GlobalPresenceContext)
  if (!ctx) {
    throw new Error('useGlobalPresence must be used within GlobalPresenceProvider')
  }
  return ctx
}
