import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  isDuplicateUserHubError,
  isForbiddenError,
  mapHubQueryError,
} from './errors'
import type { HubsResult } from './types'

export async function joinUserHub(
  userId: string,
  hubId: string,
  _hubSlug?: string,
): Promise<HubsResult<void>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { error } = await supabase.from('user_hubs').insert({
    user_id: userId,
    hub_id: hubId,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[hubs joinUserHub]', error)
    if (isDuplicateUserHubError(error)) {
      return { ok: true, data: undefined }
    }
    if (isForbiddenError(error)) {
      return { ok: false, message: mapHubQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  return { ok: true, data: undefined }
}
