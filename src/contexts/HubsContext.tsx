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
  createPrivateHub as createPrivateHubApi,
  listHubs as listHubsApi,
  type HubView,
} from '@/lib/hubs'

type HubsContextValue = {
  hubs: HubView[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  getHubId: (slug: string) => string | undefined
  createPrivateHub: (
    name: string,
    iconEmoji?: string,
  ) => Promise<
    | { ok: true; hub: HubView }
    | { ok: false; code?: 'forbidden' | 'duplicate'; message: string }
  >
}

const HubsContext = createContext<HubsContextValue | null>(null)

export function HubsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [hubs, setHubs] = useState<HubView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await listHubsApi()
    if (result.ok) {
      setHubs(result.data)
    } else {
      setHubs([])
      setError(result.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh, user?.id])

  const hubIdBySlug = useMemo(() => {
    const map: Record<string, string> = {}
    for (const hub of hubs) {
      map[hub.slug] = hub.id
    }
    return map
  }, [hubs])

  const getHubId = useCallback(
    (slug: string) => hubIdBySlug[slug],
    [hubIdBySlug],
  )

  const createPrivateHub = useCallback(
    async (name: string, iconEmoji?: string) => {
      if (!user?.id) {
        return { ok: false as const, message: 'Entre na sua conta para criar um hub.' }
      }
      const result = await createPrivateHubApi({
        name,
        creatorId: user.id,
        existingSlugs: hubs.map((h) => h.slug),
        iconEmoji,
      })
      if (!result.ok) {
        return {
          ok: false as const,
          code: result.code,
          message: result.message,
        }
      }
      setHubs((prev) => {
        if (prev.some((h) => h.id === result.data.id)) return prev
        return [...prev, result.data]
      })
      return { ok: true as const, hub: result.data }
    },
    [user?.id, hubs],
  )

  const value = useMemo(
    () => ({
      hubs,
      isLoading,
      error,
      refresh,
      getHubId,
      createPrivateHub,
    }),
    [hubs, isLoading, error, refresh, getHubId, createPrivateHub],
  )

  return <HubsContext.Provider value={value}>{children}</HubsContext.Provider>
}

export function useHubs(): HubsContextValue {
  const ctx = useContext(HubsContext)
  if (!ctx) {
    throw new Error('useHubs must be used within HubsProvider')
  }
  return ctx
}
