const DEFAULT_IDLE_MINUTES = 120

const envMinutes = Number(import.meta.env.VITE_SESSION_IDLE_MINUTES)
const idleMinutes =
  Number.isFinite(envMinutes) && envMinutes > 0 ? envMinutes : DEFAULT_IDLE_MINUTES

export const SESSION_IDLE_MS = idleMinutes * 60 * 1000

export const LAST_ACTIVITY_STORAGE_KEY = 'synoire_last_activity_at'

export function getLastActivityAt(): number | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function touchLastActivity(at: number = Date.now()): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(at))
}

export function clearLastActivity(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY)
}

/** True when there is no recorded activity or it is older than the idle window. */
export function isIdleExpired(now: number = Date.now()): boolean {
  const last = getLastActivityAt()
  if (last === null) return true
  return now - last >= SESSION_IDLE_MS
}
