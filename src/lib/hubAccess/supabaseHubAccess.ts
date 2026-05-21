import { isForbiddenError, mapHubQueryError } from '@/lib/hubs/errors'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDuplicateHubAccessError } from './errors'
import { mapHubAccessRow } from './mapAccessRow'
import type { HubAccessGrant, HubAccessResult, HubAccessRow } from './types'

export async function grantHubAccessSupabase(
  hubId: string,
  userId: string,
): Promise<HubAccessResult<HubAccessGrant>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('hub_access')
    .insert({ hub_id: hubId, user_id: userId })
    .select('hub_id, user_id, created_at, profiles(username, avatar_url)')
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[hubAccess grant]', error)
    if (isForbiddenError(error)) {
      return {
        ok: false,
        message: 'Apenas o criador do hub pode convidar membros.',
        code: 'forbidden',
      }
    }
    if (isDuplicateHubAccessError(error)) {
      return {
        ok: true,
        data: { hubId, userId, grantedAt: new Date().toISOString() },
        alreadyGranted: true,
      }
    }
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  return { ok: true, data: mapHubAccessRow(data as unknown as HubAccessRow) }
}

export async function listHubAccessSupabase(
  hubId: string,
): Promise<HubAccessResult<HubAccessGrant[]>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('hub_access')
    .select('hub_id, user_id, created_at, profiles(username, avatar_url)')
    .eq('hub_id', hubId)

  if (error) {
    if (import.meta.env.DEV) console.error('[hubAccess list]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapHubQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  const rows = (data ?? []) as unknown as HubAccessRow[]
  return { ok: true, data: rows.map(mapHubAccessRow) }
}
