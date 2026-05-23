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

  const { data: sessionData } = await supabase.auth.getSession()
  // #region agent log
  fetch('http://127.0.0.1:7355/ingest/d6106c7d-b1bd-4a41-bd9b-f9b65c9695ca',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e17dc1'},body:JSON.stringify({sessionId:'e17dc1',location:'listUserHubs.ts:before-query',message:'listUserHubs client session',data:{userId,hasClientAccessToken:Boolean(sessionData.session?.access_token),clientUserId:sessionData.session?.user?.id??null,userIdMatch:sessionData.session?.user?.id===userId},timestamp:Date.now(),hypothesisId:'A,E,I'})}).catch(()=>{});
  // #endregion

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
