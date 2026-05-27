const OAUTH_RETURN_FLASH_KEY = 'synoire_oauth_return_flash'

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined'
}

export function writeOAuthReturnFlash(message: string): void {
  const value = message.trim()
  if (!value || !canUseSessionStorage()) return
  sessionStorage.setItem(OAUTH_RETURN_FLASH_KEY, value)
}

export function consumeOAuthReturnFlash(): string | null {
  if (!canUseSessionStorage()) return null
  const value = sessionStorage.getItem(OAUTH_RETURN_FLASH_KEY)?.trim() ?? ''
  sessionStorage.removeItem(OAUTH_RETURN_FLASH_KEY)
  return value || null
}
