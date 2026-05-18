import type { RoomAccessGrant, RoomAccessRow } from './types'

function resolveProfile(
  profiles: RoomAccessRow['profiles'],
): { username: string; avatar_url: string | null } | null {
  if (!profiles) return null
  if (Array.isArray(profiles)) return profiles[0] ?? null
  return profiles
}

export function mapAccessRow(row: RoomAccessRow): RoomAccessGrant {
  const profile = resolveProfile(row.profiles)
  return {
    roomId: row.room_id,
    userId: row.user_id,
    grantedAt: row.created_at,
    username: profile?.username,
    avatarUrl: profile?.avatar_url ?? null,
  }
}
