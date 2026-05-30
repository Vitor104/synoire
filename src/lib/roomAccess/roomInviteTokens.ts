import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { grantRoomAccess } from './client'
import {
  getOrCreateRoomInviteTokenLocal,
  redeemRoomInviteTokenLocal,
} from './inviteTokenStorage'

export type InviteTokenResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

export async function getOrCreateRoomInviteToken(
  roomId: string,
): Promise<InviteTokenResult<string>> {
  if (!roomId.trim()) {
    return { ok: false, message: 'Sala inválida.' }
  }

  if (!isSupabaseConfigured) {
    return {
      ok: true,
      data: getOrCreateRoomInviteTokenLocal(roomId, roomId),
    }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return {
      ok: true,
      data: getOrCreateRoomInviteTokenLocal(roomId, roomId),
    }
  }

  const { data, error } = await supabase.rpc('get_or_create_room_invite_token', {
    p_room_id: roomId,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[roomInviteTokens get]', error)
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  if (typeof data !== 'string' || !data.trim()) {
    return { ok: false, message: 'Não foi possível gerar o link de convite.' }
  }

  return { ok: true, data }
}

export async function redeemRoomInviteToken(
  roomId: string,
  token: string,
  userId: string,
): Promise<InviteTokenResult<boolean>> {
  if (!roomId.trim() || !token.trim() || !userId.trim()) {
    return { ok: true, data: false }
  }

  if (!isSupabaseConfigured) {
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
