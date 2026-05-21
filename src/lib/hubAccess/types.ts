export const HUB_ACCESS_STORAGE_KEY = 'synoire_hub_access'

export type HubAccessGrant = {
  hubId: string
  userId: string
  grantedAt: string
  username?: string
  avatarUrl?: string | null
}

export type HubAccessRow = {
  hub_id: string
  user_id: string
  created_at: string
  profiles?: { username: string; avatar_url: string | null } | { username: string; avatar_url: string | null }[] | null
}

export type HubAccessResult<T> =
  | { ok: true; data: T; alreadyGranted?: boolean }
  | { ok: false; message: string; code?: 'forbidden' }
