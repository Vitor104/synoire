import type { HubView } from '@/lib/hubs/types'
import { PRIVATE_HUBS_STORAGE_KEY } from './types'

export function readPrivateHubs(): HubView[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(PRIVATE_HUBS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HubView[]
    return Array.isArray(parsed) ? parsed.filter((h) => h?.isPrivate && h.slug) : []
  } catch {
    return []
  }
}

export function writePrivateHubs(hubs: HubView[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(PRIVATE_HUBS_STORAGE_KEY, JSON.stringify(hubs))
  } catch {
    // quota or private mode
  }
}

export function appendPrivateHub(hub: HubView): HubView[] {
  const hubs = readPrivateHubs()
  const next = [...hubs, hub]
  writePrivateHubs(next)
  return next
}
