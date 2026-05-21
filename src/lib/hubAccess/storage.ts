import { HUB_ACCESS_STORAGE_KEY, type HubAccessGrant } from './types'

function readGrants(): HubAccessGrant[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(HUB_ACCESS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidGrant)
  } catch {
    return []
  }
}

function writeGrants(grants: HubAccessGrant[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(HUB_ACCESS_STORAGE_KEY, JSON.stringify(grants))
  } catch {
    // quota or private mode
  }
}

function isValidGrant(item: unknown): item is HubAccessGrant {
  if (!item || typeof item !== 'object') return false
  const g = item as HubAccessGrant
  return (
    typeof g.hubId === 'string' &&
    typeof g.userId === 'string' &&
    typeof g.grantedAt === 'string'
  )
}

export function grantHubAccessLocal(hubId: string, userId: string): HubAccessGrant {
  const grants = readGrants()
  const existing = grants.find((g) => g.hubId === hubId && g.userId === userId)
  if (existing) return existing

  const grant: HubAccessGrant = {
    hubId,
    userId,
    grantedAt: new Date().toISOString(),
  }
  writeGrants([...grants, grant])
  return grant
}

export function listGrantsForHub(hubId: string): HubAccessGrant[] {
  return readGrants().filter((g) => g.hubId === hubId)
}

export function clearHubAccessForTests(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(HUB_ACCESS_STORAGE_KEY)
}
