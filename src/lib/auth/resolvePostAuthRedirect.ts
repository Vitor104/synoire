const DEFAULT_REDIRECT = '/painel'

/** Safe internal path for post-login redirect (preserves query string). */
export function resolvePostAuthRedirect(from?: string | null): string {
  if (!from || typeof from !== 'string') return DEFAULT_REDIRECT
  const trimmed = from.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_REDIRECT
  }
  if (trimmed.startsWith('/entrar')) return DEFAULT_REDIRECT
  return trimmed
}
