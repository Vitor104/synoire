export function buildHubInviteUrl(
  slug: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
  token?: string,
): string {
  const base = `${origin}/hubs/${encodeURIComponent(slug)}`
  if (!token?.trim()) return base
  const params = new URLSearchParams({ invite: token.trim() })
  return `${base}?${params.toString()}`
}

export async function copyHubInviteUrl(slug: string, token?: string): Promise<boolean> {
  const url = buildHubInviteUrl(slug, undefined, token)
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      // fall through to legacy copy
    }
  }
  return copyTextLegacy(url)
}

function copyTextLegacy(text: string): boolean {
  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(textarea)
  return ok
}
