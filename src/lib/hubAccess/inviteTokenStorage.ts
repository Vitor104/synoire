export const HUB_INVITE_TOKENS_STORAGE_KEY = 'synoire_hub_invite_tokens'

export type HubInviteTokenRow = {
  hubId: string
  token: string
  createdBy: string
}

function readRows(): HubInviteTokenRow[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(HUB_INVITE_TOKENS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidRow)
  } catch {
    return []
  }
}

function writeRows(rows: HubInviteTokenRow[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(HUB_INVITE_TOKENS_STORAGE_KEY, JSON.stringify(rows))
  } catch {
    // quota or private mode
  }
}

function isValidRow(item: unknown): item is HubInviteTokenRow {
  if (!item || typeof item !== 'object') return false
  const r = item as HubInviteTokenRow
  return (
    typeof r.hubId === 'string' &&
    typeof r.token === 'string' &&
    typeof r.createdBy === 'string'
  )
}

export function generateInviteToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`
}

export function getOrCreateHubInviteTokenLocal(
  hubId: string,
  createdBy: string,
): string {
  const rows = readRows()
  const existing = rows.find((r) => r.hubId === hubId)
  if (existing) return existing.token

  const token = generateInviteToken()
  writeRows([...rows, { hubId, token, createdBy }])
  return token
}

export function redeemHubInviteTokenLocal(hubId: string, token: string): boolean {
  const rows = readRows()
  const match = rows.find((r) => r.hubId === hubId && r.token === token)
  return Boolean(match)
}

export function clearHubInviteTokensForTests(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(HUB_INVITE_TOKENS_STORAGE_KEY)
}
