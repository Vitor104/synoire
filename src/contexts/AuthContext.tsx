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
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import {
  clearOAuthCallbackFromUrl,
  hasOAuthCodeInUrl,
  isAuthSessionReady,
  isOAuthCallbackUrl,
  shouldIgnoreAuthSessionDuringOAuth,
  OAUTH_PENDING_STORAGE_KEY,
  shouldSkipIdleCheckForOAuth,
} from '@/lib/auth/oauthCallback'
import {
  clearLastActivity,
  isIdleExpired,
  touchLastActivity,
} from '@/lib/auth/sessionIdle'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isSessionReady: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ACTIVITY_TOUCH_EVENTS: AuthChangeEvent[] = [
  'SIGNED_IN',
  'TOKEN_REFRESHED',
  'INITIAL_SESSION',
]

const SESSION_READY_EVENTS: AuthChangeEvent[] = [
  'SIGNED_IN',
  'INITIAL_SESSION',
  'TOKEN_REFRESHED',
]

const ACTIVITY_THROTTLE_MS = 30_000
const IDLE_CHECK_INTERVAL_MS = 60_000

function applySession(
  nextSession: Session | null,
  setSession: (s: Session | null) => void,
  setUser: (u: User | null) => void,
) {
  setSession(nextSession)
  setUser(nextSession?.user ?? null)
}

function clearOAuthPendingFlag(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(OAUTH_PENDING_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [isOAuthExchanging, setIsOAuthExchanging] = useState(() =>
    isOAuthCallbackUrl(),
  )
  const [clientTokenReady, setClientTokenReady] = useState(false)
  const lastActivityTouchRef = useRef(0)
  const pendingOAuthRef = useRef(isOAuthCallbackUrl())

  useEffect(() => {
    if (!isOAuthExchanging) return
    const search = new URLSearchParams(window.location.search)
    if (search.has('error') && !search.has('code')) {
      pendingOAuthRef.current = false
      setIsOAuthExchanging(false)
      clearOAuthCallbackFromUrl()
      setIsLoading(false)
    }
  }, [isOAuthExchanging])

  const expireIdleSession = useCallback(async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut({ scope: 'local' })
    }
    clearLastActivity()
    applySession(null, setSession, setUser)
  }, [])

  const throttledTouchActivity = useCallback(() => {
    const now = Date.now()
    if (now - lastActivityTouchRef.current < ACTIVITY_THROTTLE_MS) return
    lastActivityTouchRef.current = now
    touchLastActivity(now)
  }, [])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    const pendingOAuth = pendingOAuthRef.current

    const finishLoading = () => {
      if (!cancelled) setIsLoading(false)
    }

    const shouldSkipIdleCheck = (): boolean =>
      pendingOAuthRef.current ||
      hasOAuthCodeInUrl() ||
      shouldSkipIdleCheckForOAuth()

    const checkIdleAndExpire = async (): Promise<boolean> => {
      if (shouldSkipIdleCheck()) return false
      if (!isIdleExpired()) return false
      await expireIdleSession()
      return true
    }

    const finishOAuthCallback = (nextSession: Session | null) => {
      if (!pendingOAuthRef.current) return
      pendingOAuthRef.current = false
      setIsOAuthExchanging(false)
      clearOAuthPendingFlag()
      if (nextSession?.access_token) {
        touchLastActivity()
        lastActivityTouchRef.current = Date.now()
        clearOAuthCallbackFromUrl()
      }
    }

    void (async () => {
      if (pendingOAuth || shouldSkipIdleCheckForOAuth()) {
        return
      }

      if (await checkIdleAndExpire()) {
        finishLoading()
        return
      }

      const { data } = await supabase.auth.getSession()
      if (cancelled) return

      if (data.session) {
        touchLastActivity()
      }

      applySession(data.session, setSession, setUser)
      finishLoading()
    })()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (cancelled) return

      if (nextSession?.user && ACTIVITY_TOUCH_EVENTS.includes(event)) {
        touchLastActivity()
        lastActivityTouchRef.current = Date.now()
      }

      if (!nextSession?.user) {
        if (hasOAuthCodeInUrl()) {
          return
        }
        clearLastActivity()
        applySession(null, setSession, setUser)
        pendingOAuthRef.current = false
        setIsOAuthExchanging(false)
        clearOAuthCallbackFromUrl()
        finishLoading()
        return
      }

      if (shouldIgnoreAuthSessionDuringOAuth(event, nextSession)) {
        return
      }

      if (await checkIdleAndExpire()) {
        finishLoading()
        return
      }

      applySession(nextSession, setSession, setUser)

      if (
        pendingOAuthRef.current &&
        nextSession.access_token &&
        SESSION_READY_EVENTS.includes(event)
      ) {
        finishOAuthCallback(nextSession)
      }

      finishLoading()
    })

    const onActivity = () => {
      if (!document.hasFocus() && document.visibilityState !== 'visible') return
      throttledTouchActivity()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        throttledTouchActivity()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('pointerdown', onActivity)

    const idleInterval = window.setInterval(() => {
      if (shouldSkipIdleCheck()) return
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session?.user || cancelled) return
        if (isIdleExpired()) {
          void expireIdleSession()
        }
      })
    }, IDLE_CHECK_INTERVAL_MS)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('pointerdown', onActivity)
      window.clearInterval(idleInterval)
    }
  }, [expireIdleSession, throttledTouchActivity])

  useEffect(() => {
    const supabase = getSupabase()
    if (
      !supabase ||
      isLoading ||
      isOAuthExchanging ||
      !session?.access_token ||
      !session.user?.id
    ) {
      setClientTokenReady(false)
      return
    }

    let cancelled = false
    const userId = session.user.id

    const verifyClientSession = () => {
      void supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return
        const ready = Boolean(
          data.session?.access_token && data.session.user?.id === userId,
        )
        setClientTokenReady(ready)
      })
    }

    verifyClientSession()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verifyClientSession()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [
    session?.access_token,
    session?.user?.id,
    isLoading,
    isOAuthExchanging,
  ])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut({ scope: 'global' })
    }
    clearLastActivity()
    clearOAuthPendingFlag()
    applySession(null, setSession, setUser)
  }, [])

  const isSessionReady = isSupabaseConfigured
    ? isAuthSessionReady(session, isLoading, isOAuthExchanging) &&
      clientTokenReady
    : !isLoading

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading: isLoading || isOAuthExchanging,
      isAuthenticated: Boolean(session?.user),
      isSessionReady,
      signOut,
    }),
    [user, session, isLoading, isOAuthExchanging, isSessionReady, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
