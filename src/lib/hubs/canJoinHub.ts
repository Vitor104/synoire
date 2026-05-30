import { isAccessGrantActive } from '@/lib/accessInvites/constants'
import { listGrantsForHub } from '@/lib/hubAccess/storage'
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
  if (!isSupabaseConfigured) {
    const grant = listGrantsForHub(hubId).find((g) => g.userId === userId)
    return grant ? isAccessGrantActive(grant.grantedAt) : false
  }

  const supabase = getSupabase()
  if (!supabase) {
    const grant = listGrantsForHub(hubId).find((g) => g.userId === userId)
    return grant ? isAccessGrantActive(grant.grantedAt) : false
  }

  const { data, error } = await supabase
    .from('hub_access')
    .select('hub_id, created_at')
    .eq('hub_id', hubId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[canJoinHub grant]', error)
    return false
  }

  if (!data?.created_at) return false
  return isAccessGrantActive(data.created_at)
}

function userIsHubCreator(hub: HubView, userId: string): boolean {
  return Boolean(hub.creatorId && hub.creatorId === userId)
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

  const [isMember, hasGrant] = await Promise.all([
    userIsHubMember(hub.id, userId),
    userHasHubAccessGrant(hub.id, userId),
  ])

  if (isMember || hasGrant) {
    return { status: 'allowed' }
  }

  return { status: 'denied_private' }
}
