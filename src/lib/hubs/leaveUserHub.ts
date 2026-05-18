import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isHubJoined, readJoinedHubSlugs, writeJoinedHubSlugs } from '@/lib/joinedHubs'
import { isDemoMode } from './demo'
import { mapHubQueryError } from './errors'
import type { HubsResult } from './types'

export async function leaveUserHub(
  userId: string,
  hubId: string,
  hubSlug?: string,
): Promise<HubsResult<void>> {
  if (isDemoMode) {
    if (hubSlug) {
      const slugs = readJoinedHubSlugs()
      if (isHubJoined(hubSlug, slugs)) {
        writeJoinedHubSlugs(slugs.filter((s) => s !== hubSlug))
      }
    }
    return { ok: true, data: undefined }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { error } = await supabase
    .from('user_hubs')
    .delete()
    .eq('user_id', userId)
    .eq('hub_id', hubId)

  if (error) {
    if (import.meta.env.DEV) console.error('[hubs leaveUserHub]', error)
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  return { ok: true, data: undefined }
}
