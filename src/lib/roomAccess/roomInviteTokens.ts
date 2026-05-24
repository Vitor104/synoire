import { isDemoMode } from '@/lib/hubRooms/demo'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { grantRoomAccess } from './client'
import {
  generateInviteToken,
  getOrCreateRoomInviteTokenLocal,
  redeemRoomInviteTokenLocal,
} from './inviteTokenStorage'

export type InviteTokenResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

export async function getOrCreateRoomInviteToken(
  roomId: string,
  creatorId: string,
): Promise<InviteTokenResult<string>> {
  if (!roomId.trim() || !creatorId.trim()) {
    return { ok: false, message: 'Sala inválida.' }
  }

  if (isDemoMode || !isSupabaseConfigured) {
    return {
      ok: true,
      data: getOrCreateRoomInviteTokenLocal(roomId, creatorId),
    }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return {
      ok: true,
      data: getOrCreateRoomInviteTokenLocal(roomId, creatorId),
    }
  }

  const { data: existing, error: selectError } = await supabase
    .from('room_invite_tokens')
    .select('token')
    .eq('room_id', roomId)
    .maybeSingle()

  if (selectError) {
    if (import.meta.env.DEV) console.error('[roomInviteTokens get]', selectError)
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  if (existing?.token) {
    return { ok: true, data: existing.token as string }
  }

  const token = generateInviteToken()
  const { error: insertError } = await supabase.from('room_invite_tokens').insert({
    room_id: roomId,
    token,
    created_by: creatorId,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: retry } = await supabase
        .from('room_invite_tokens')
        .select('token')
        .eq('room_id', roomId)
        .maybeSingle()
      if (retry?.token) return { ok: true, data: retry.token as string }
    }
    if (import.meta.env.DEV) console.error('[roomInviteTokens insert]', insertError)
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  return { ok: true, data: token }
}

export async function redeemRoomInviteToken(
  roomId: string,
  token: string,
  userId: string,
): Promise<InviteTokenResult<boolean>> {
  if (!roomId.trim() || !token.trim() || !userId.trim()) {
    return { ok: true, data: false }
  }

  if (isDemoMode || !isSupabaseConfigured) {
    const valid = redeemRoomInviteTokenLocal(roomId, token)
    if (valid) {
      await grantRoomAccess(roomId, userId)
      return { ok: true, data: true }
    }
    return { ok: true, data: false }
  }

  const supabase = getSupabase()
  if (!supabase) {
    const valid = redeemRoomInviteTokenLocal(roomId, token)
    if (valid) {
      await grantRoomAccess(roomId, userId)
      return { ok: true, data: true }
    }
    return { ok: true, data: false }
  }

  const { data, error } = await supabase.rpc('redeem_room_invite', {
    p_room_id: roomId,
    p_token: token,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[roomInviteTokens redeem]', error)
    return { ok: false, message: 'Não foi possível usar o link de convite.' }
  }

  const payload = data as { ok?: boolean } | null
  return { ok: true, data: Boolean(payload?.ok) }
}
