import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { getDemoJoinedHubs, isDemoMode } from './demo'
import { mapHubQueryError } from './errors'
import { mapHubRow } from './mapHubRow'
import type { HubRow, HubView, HubsResult, UserHubRow } from './types'

function extractHubFromUserHubRow(row: UserHubRow): HubRow | null {
  const nested = row.hubs
  if (!nested) return null
  if (Array.isArray(nested)) return nested[0] ?? null
  return nested
}

export async function listUserHubs(
  userId: string,
): Promise<HubsResult<HubView[]>> {
  if (isDemoMode) {
    return { ok: true, data: getDemoJoinedHubs() }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('user_hubs')
    .select('*, hubs(*)')
    .eq('user_id', userId)

  if (error) {
    if (import.meta.env.DEV) console.error('[hubs listUserHubs]', error)
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  const hubs: HubView[] = []
  for (const row of (data as UserHubRow[] | null) ?? []) {
    const hubRow = extractHubFromUserHubRow(row)
    if (hubRow) hubs.push(mapHubRow(hubRow))
  }

  return { ok: true, data: hubs }
}
