import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export function isOAuthCallbackUrl(location: Location = window.location): boolean {
  const search = new URLSearchParams(location.search)
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
  return (
    search.has('code') ||
    search.has('error') ||
    search.has('error_description') ||
    hash.has('access_token') ||
    hash.has('error')
  )
}

/** PKCE authorization code still present (exchange may be in progress). */
export function hasOAuthCodeInUrl(location: Location = window.location): boolean {
  return new URLSearchParams(location.search).has('code')
}

/**
 * During PKCE callback, ignore cached INITIAL_SESSION so providers do not
 * query with a stale or not-yet-exchanged session (requests as anon → 401).
 */
export function shouldIgnoreAuthSessionDuringOAuth(
  event: AuthChangeEvent,
  session: Session | null,
  location: Location = window.location,
): boolean {
  if (!hasOAuthCodeInUrl(location)) return false
  if (!session?.access_token) return true
  return event === 'INITIAL_SESSION'
}

export function isAuthSessionReady(
  session: Session | null,
  authLoading: boolean,
  oauthExchanging = false,
): boolean {
  return (
    !authLoading && !oauthExchanging && Boolean(session?.access_token)
  )
}

/** Remove OAuth query/hash params after session is established. */
export function clearOAuthCallbackFromUrl(location: Location = window.location): void {
  const url = new URL(location.href)
  const hadSearch =
    url.searchParams.has('code') ||
    url.searchParams.has('error') ||
    url.searchParams.has('error_description')
  const hadHash =
    url.hash.includes('access_token') || url.hash.includes('error')

  if (!hadSearch && !hadHash) return

  url.searchParams.delete('code')
  url.searchParams.delete('error')
  url.searchParams.delete('error_description')
  url.hash = ''
  window.history.replaceState({}, '', url.pathname + url.search)
}
