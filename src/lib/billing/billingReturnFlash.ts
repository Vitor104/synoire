const BILLING_RETURN_FLASH_KEY = 'synoire_billing_return_flash'

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined'
}

export function writeBillingReturnFlash(message: string): void {
  const value = message.trim()
  if (!value || !canUseSessionStorage()) return
  sessionStorage.setItem(BILLING_RETURN_FLASH_KEY, value)
}

export function consumeBillingReturnFlash(): string | null {
  if (!canUseSessionStorage()) return null
  const value = sessionStorage.getItem(BILLING_RETURN_FLASH_KEY)?.trim() ?? ''
  sessionStorage.removeItem(BILLING_RETURN_FLASH_KEY)
  return value || null
}
