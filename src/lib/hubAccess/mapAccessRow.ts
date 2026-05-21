import type { HubAccessGrant, HubAccessRow } from './types'

function resolveProfile(
  profiles: HubAccessRow['profiles'],
): { username: string; avatar_url: string | null } | null {
  if (!profiles) return null
  if (Array.isArray(profiles)) return profiles[0] ?? null
  return profiles
}

export function mapHubAccessRow(row: HubAccessRow): HubAccessGrant {
  const profile = resolveProfile(row.profiles)
  return {
    hubId: row.hub_id,
    userId: row.user_id,
    grantedAt: row.created_at,
    username: profile?.username,
    avatarUrl: profile?.avatar_url ?? null,
  }
}
