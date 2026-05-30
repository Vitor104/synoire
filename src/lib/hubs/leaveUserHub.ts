import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mapHubQueryError } from './errors'
import type { HubsResult } from './types'

export async function leaveUserHub(
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
