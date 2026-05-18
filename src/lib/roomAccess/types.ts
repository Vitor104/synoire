export const ROOM_ACCESS_STORAGE_KEY = 'synoire_room_access'

export type RoomAccessGrant = {
  roomId: string
  userId: string
  grantedAt: string
  username?: string
  avatarUrl?: string | null
}

export type RoomAccessRow = {
  room_id: string
  user_id: string
  created_at: string
  profiles?: { username: string; avatar_url: string | null } | { username: string; avatar_url: string | null }[] | null
}

export type RoomAccessResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: 'forbidden' }
