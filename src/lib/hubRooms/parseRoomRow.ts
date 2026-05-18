import type { RoomRow } from './types'

type HubJoin = { slug: string } | { slug: string }[] | null

export type RoomRowWithHub = RoomRow & {
  hubs?: HubJoin
}

export function resolveHubSlug(row: RoomRowWithHub, fallbackSlug: string): string {
  const hubs = row.hubs
  if (!hubs) return fallbackSlug
  if (Array.isArray(hubs)) return hubs[0]?.slug ?? fallbackSlug
  return hubs.slug ?? fallbackSlug
}

export function stripHubJoin(row: RoomRowWithHub): RoomRow {
  const { hubs: _hubs, ...rest } = row
  return rest as RoomRow
}
