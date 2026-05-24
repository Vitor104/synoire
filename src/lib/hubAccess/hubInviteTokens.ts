import { isDemoMode } from '@/lib/hubRooms/demo'
import { isHubJoined, readJoinedHubSlugs, writeJoinedHubSlugs } from '@/lib/joinedHubs'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { grantHubAccess } from './client'
import {
  generateInviteToken,
  getOrCreateHubInviteTokenLocal,
  redeemHubInviteTokenLocal,
} from './inviteTokenStorage'

export type InviteTokenResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

export async function getOrCreateHubInviteToken(
  hubId: string,
  creatorId: string,
): Promise<InviteTokenResult<string>> {
  if (!hubId.trim() || !creatorId.trim()) {
    return { ok: false, message: 'Hub inválido.' }
  }

  if (isDemoMode || !isSupabaseConfigured) {
    return {
      ok: true,
      data: getOrCreateHubInviteTokenLocal(hubId, creatorId),
    }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return {
      ok: true,
      data: getOrCreateHubInviteTokenLocal(hubId, creatorId),
    }
  }

  const { data: existing, error: selectError } = await supabase
    .from('hub_invite_tokens')
    .select('token')
    .eq('hub_id', hubId)
    .maybeSingle()

  if (selectError) {
    if (import.meta.env.DEV) console.error('[hubInviteTokens get]', selectError)
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  if (existing?.token) {
    return { ok: true, data: existing.token as string }
  }

  const token = generateInviteToken()
  const { error: insertError } = await supabase.from('hub_invite_tokens').insert({
    hub_id: hubId,
    token,
    created_by: creatorId,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: retry } = await supabase
        .from('hub_invite_tokens')
        .select('token')
        .eq('hub_id', hubId)
        .maybeSingle()
      if (retry?.token) return { ok: true, data: retry.token as string }
    }
    if (import.meta.env.DEV) console.error('[hubInviteTokens insert]', insertError)
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  return { ok: true, data: token }
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
