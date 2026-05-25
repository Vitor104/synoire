import { isDemoMode } from '@/lib/hubRooms/demo'
import { isHubJoined, readJoinedHubSlugs, writeJoinedHubSlugs } from '@/lib/joinedHubs'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { grantHubAccess } from './client'
import {
  getOrCreateHubInviteTokenLocal,
  redeemHubInviteTokenLocal,
} from './inviteTokenStorage'

export type InviteTokenResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

export async function getOrCreateHubInviteToken(
  hubId: string,
): Promise<InviteTokenResult<string>> {
  if (!hubId.trim()) {
    return { ok: false, message: 'Hub inválido.' }
  }

  if (isDemoMode || !isSupabaseConfigured) {
    return {
      ok: true,
      data: getOrCreateHubInviteTokenLocal(hubId, hubId),
    }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return {
      ok: true,
      data: getOrCreateHubInviteTokenLocal(hubId, hubId),
    }
  }

  const { data, error } = await supabase.rpc('get_or_create_hub_invite_token', {
    p_hub_id: hubId,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[hubInviteTokens get]', error)
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  if (typeof data !== 'string' || !data.trim()) {
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  return { ok: true, data }
}

export async function redeemHubInviteToken(
  hubId: string,
  hubSlug: string | undefined,
  token: string,
  userId: string,
): Promise<InviteTokenResult<boolean>> {
  if (!hubId.trim() || !token.trim() || !userId.trim()) {
    return { ok: true, data: false }
  }

  if (isDemoMode || !isSupabaseConfigured) {
    const valid = redeemHubInviteTokenLocal(hubId, token)
    if (!valid) return { ok: true, data: false }

    await grantHubAccess(hubId, userId)
    if (hubSlug) {
      const slugs = readJoinedHubSlugs()
      if (!isHubJoined(hubSlug, slugs)) {
        writeJoinedHubSlugs([...slugs, hubSlug])
      }
    }
    return { ok: true, data: true }
  }

  const supabase = getSupabase()
  if (!supabase) {
    const valid = redeemHubInviteTokenLocal(hubId, token)
    if (!valid) return { ok: true, data: false }
    await grantHubAccess(hubId, userId)
    if (hubSlug) {
      const slugs = readJoinedHubSlugs()
      if (!isHubJoined(hubSlug, slugs)) {
        writeJoinedHubSlugs([...slugs, hubSlug])
      }
    }
    return { ok: true, data: true }
  }

  const { data, error } = await supabase.rpc('redeem_hub_invite', {
    p_hub_id: hubId,
    p_token: token,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[hubInviteTokens redeem]', error)
    return { ok: false, message: 'Não foi possível usar o link de convite.' }
  }

  const payload = data as { ok?: boolean } | null
  return { ok: true, data: Boolean(payload?.ok) }
}
