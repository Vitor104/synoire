import { isDemoMode } from '@/lib/hubRooms/demo'
import { listGrantsForHub } from '@/lib/hubAccess/storage'
import { isHubJoined, readJoinedHubSlugs } from '@/lib/joinedHubs'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { getHubBySlug } from './getHubBySlug'
import type { HubView } from './types'

export type CanJoinHubStatus =
  | 'allowed'
  | 'denied_private'
  | 'not_found'
  | 'error'

export type CanJoinHubResult =
  | { status: 'allowed' }
  | { status: 'denied_private' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

async function userIsHubMember(hubId: string, userId: string): Promise<boolean> {
  if (isDemoMode) {
    return false
  }

  if (!isSupabaseConfigured) return false

  const supabase = getSupabase()
  if (!supabase) return false

  const { data, error } = await supabase
    .from('user_hubs')
    .select('hub_id')
    .eq('hub_id', hubId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[canJoinHub membership]', error)
    return false
  }

  return Boolean(data)
}

async function userHasHubAccessGrant(hubId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || isDemoMode) {
    return listGrantsForHub(hubId).some((g) => g.userId === userId)
  }

  const supabase = getSupabase()
  if (!supabase) {
    return listGrantsForHub(hubId).some((g) => g.userId === userId)
  }

  const { data, error } = await supabase
    .from('hub_access')
    .select('hub_id')
    .eq('hub_id', hubId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[canJoinHub grant]', error)
    return false
  }

  return Boolean(data)
}

function userIsHubCreator(hub: HubView, userId: string): boolean {
  return Boolean(hub.creatorId && hub.creatorId === userId)
}

function userJoinedHubInDemo(slug: string, userId: string): boolean {
  if (!isDemoMode) return false
  void userId
  return isHubJoined(slug, readJoinedHubSlugs())
}

export async function canJoinHub(
  slug: string,
  userId: string,
): Promise<CanJoinHubResult> {
  if (!slug.trim() || !userId.trim()) {
    return { status: 'not_found' }
  }

  const result = await getHubBySlug(slug)
  if (!result.ok) {
    return { status: 'error', message: result.message }
  }

  const hub = result.data
  if (!hub) {
    return { status: 'not_found' }
  }

  if (!hub.isPrivate) {
    return { status: 'allowed' }
  }

  if (userIsHubCreator(hub, userId)) {
    return { status: 'allowed' }
  }

  if (userJoinedHubInDemo(slug, userId)) {
    return { status: 'allowed' }
  }

  const [isMember, hasGrant] = await Promise.all([
    userIsHubMember(hub.id, userId),
    userHasHubAccessGrant(hub.id, userId),
  ])

  if (isMember || hasGrant) {
    return { status: 'allowed' }
  }

  return { status: 'denied_private' }
}
