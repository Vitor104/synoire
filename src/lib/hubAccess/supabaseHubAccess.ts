import { isForbiddenError, mapHubQueryError } from '@/lib/hubs/errors'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
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

  const { data, error } = await supabase.rpc('grant_hub_access', {
    p_hub_id: hubId,
    p_user_id: userId,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[hubAccess grant]', error)
    if (isForbiddenError(error)) {
      return {
        ok: false,
        message: 'Apenas o criador do hub pode convidar membros.',
        code: 'forbidden',
      }
    }
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  const payload = data as
    | {
        hub_id?: string
        user_id?: string
        created_at?: string
        already_granted?: boolean
      }
    | null

  if (!payload?.hub_id || !payload.user_id || !payload.created_at) {
    return { ok: false, message: 'Não foi possível liberar o acesso ao hub.' }
  }

  return {
    ok: true,
    data: {
      hubId: payload.hub_id,
      userId: payload.user_id,
      grantedAt: payload.created_at,
    },
    alreadyGranted: Boolean(payload.already_granted),
  }
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
