/** UI card shape used across hub pages */
export type HubView = {
  id: string
  slug: string
  name: string
  shortLabel: string
  accentStripe: string
  accentBadge: string
  isPrivate?: boolean
  iconEmoji?: string
  creatorId?: string | null
}

/** @deprecated Use HubView — kept for gradual migration */
export type HubSummary = HubView

export type HubRow = {
  id: string
  name: string
  slug: string
  is_private: boolean
  creator_id: string | null
  icon_emoji?: string | null
  created_at?: string
}

export type UserHubRow = {
  user_id: string
  hub_id: string
  hubs?: HubRow | HubRow[] | null
  created_at?: string
}

export type HubsResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: 'forbidden' | 'duplicate' }
