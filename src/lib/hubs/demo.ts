import { SAMPLE_HUBS } from '@/data/sampleHubs'
import { readPrivateHubs } from '@/lib/privateHubs/storage'
import { readJoinedHubSlugs } from '@/lib/joinedHubs/storage'
import { mapHubRow } from './mapHubRow'
import type { HubRow, HubView } from './types'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const DEMO_HUB_ROWS: HubRow[] = SAMPLE_HUBS.map((h) => ({
  id: `demo-${h.slug}`,
  name: h.name,
  slug: h.slug,
  is_private: Boolean(h.isPrivate),
  creator_id: null,
  icon_emoji: h.iconEmoji ?? null,
}))

export function getDemoHubs(): HubView[] {
  const privateRows: HubRow[] = readPrivateHubs().map((h) => ({
    id: `demo-private-${h.slug}`,
    name: h.name,
    slug: h.slug,
    is_private: true,
    creator_id: h.creatorId ?? null,
    icon_emoji: h.iconEmoji ?? null,
  }))
  return [...DEMO_HUB_ROWS, ...privateRows].map(mapHubRow)
}

export function getDemoHubBySlug(slug: string): HubView | undefined {
  return getDemoHubs().find((h) => h.slug === slug)
}

export function getDemoJoinedHubs(): HubView[] {
  const slugs = readJoinedHubSlugs()
  const all = getDemoHubs()
  return slugs
    .map((slug) => all.find((h) => h.slug === slug))
    .filter((h): h is HubView => h !== undefined)
}
