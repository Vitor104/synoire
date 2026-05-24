export const ROOM_INVITE_TOKENS_STORAGE_KEY = 'synoire_room_invite_tokens'

export type RoomInviteTokenRow = {
  roomId: string
  token: string
  createdBy: string
}

function readRows(): RoomInviteTokenRow[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(ROOM_INVITE_TOKENS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidRow)
  } catch {
    return []
  }
}

function writeRows(rows: RoomInviteTokenRow[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(ROOM_INVITE_TOKENS_STORAGE_KEY, JSON.stringify(rows))
  } catch {
    // quota or private mode
  }
}

function isValidRow(item: unknown): item is RoomInviteTokenRow {
  if (!item || typeof item !== 'object') return false
  const r = item as RoomInviteTokenRow
  return (
    typeof r.roomId === 'string' &&
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

export function getOrCreateRoomInviteTokenLocal(
  roomId: string,
  createdBy: string,
): string {
  const rows = readRows()
  const existing = rows.find((r) => r.roomId === roomId)
  if (existing) return existing.token

  const token = generateInviteToken()
  writeRows([...rows, { roomId, token, createdBy }])
  return token
}

export function redeemRoomInviteTokenLocal(
  roomId: string,
  token: string,
): boolean {
  const rows = readRows()
  const match = rows.find((r) => r.roomId === roomId && r.token === token)
  return Boolean(match)
}

export function clearRoomInviteTokensForTests(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(ROOM_INVITE_TOKENS_STORAGE_KEY)
}
