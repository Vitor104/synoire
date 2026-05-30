import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mapHubQueryError } from './errors'
import { mapHubRow } from './mapHubRow'
import type { HubRow, HubView, HubsResult } from './types'

export async function listHubs(): Promise<HubsResult<HubView[]>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase.from('hubs').select('*')

  if (error) {
    if (import.meta.env.DEV) console.error('[hubs listHubs]', error)
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  const hubs = (data as HubRow[] | null)?.map(mapHubRow) ?? []
  return { ok: true, data: hubs }
}
