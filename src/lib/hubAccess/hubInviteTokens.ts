import { mapHubRow } from '@/lib/hubs/mapHubRow'
import type { HubRow, HubView } from '@/lib/hubs/types'
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

function resolveRpcHubRow(data: unknown): HubRow | null {
  if (!data) return null
  if (Array.isArray(data)) {
    const [first] = data
    return first && typeof first === 'object' ? (first as HubRow) : null
  }
  return typeof data === 'object' ? (data as HubRow) : null
}

export async function getOrCreateHubInviteToken(
  hubId: string,
): Promise<InviteTokenResult<string>> {
  if (!hubId.trim()) {
    return { ok: false, message: 'Hub inválido.' }
  }

  if (!isSupabaseConfigured) {
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

  if (!isSupabaseConfigured) {
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

export async function resolveHubInviteTarget(
  slug: string,
  token: string,
): Promise<InviteTokenResult<HubView | null>> {
  const normalizedSlug = slug.trim()
  const normalizedToken = token.trim()

  if (!normalizedSlug || !normalizedToken) {
    return { ok: true, data: null }
  }

  if (!isSupabaseConfigured) {
    return { ok: true, data: null }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: true, data: null }
  }

  const { data, error } = await supabase.rpc('resolve_hub_invite_target', {
    p_slug: normalizedSlug,
    p_token: normalizedToken,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[hubInviteTokens resolve]', error)
    return { ok: false, message: 'Não foi possível validar o link de convite.' }
  }

  const row = resolveRpcHubRow(data)
  return { ok: true, data: row ? mapHubRow(row) : null }
}
