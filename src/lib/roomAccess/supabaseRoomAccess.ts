import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isForbiddenError, mapRoomQueryError } from '@/lib/hubRooms/errors'
import { isAccessGrantActive } from '@/lib/accessInvites/constants'
import { mapAccessRow } from './mapAccessRow'
import type { RoomAccessGrant, RoomAccessResult, RoomAccessRow } from './types'

type GrantRoomAccessPayload = {
  room_id?: string
  user_id?: string
  created_at?: string
  accepted_at?: string | null
  already_granted?: boolean
}

type AcceptRoomAccessPayload = {
  ok?: boolean
  room_id?: string
  user_id?: string
  created_at?: string
  accepted_at?: string | null
}

function mapGrantPayload(payload: GrantRoomAccessPayload | null): RoomAccessGrant | null {
  if (!payload?.room_id || !payload.user_id || !payload.created_at) return null
  return {
    roomId: payload.room_id,
    userId: payload.user_id,
    grantedAt: payload.created_at,
    acceptedAt: payload.accepted_at ?? null,
  }
}

export async function grantRoomAccessSupabase(
  roomId: string,
  userId: string,
): Promise<RoomAccessResult<RoomAccessGrant>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase.rpc('grant_room_access', {
    p_room_id: roomId,
    p_user_id: userId,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[roomAccess grant]', error)
    if (isForbiddenError(error)) {
      return {
        ok: false,
        message: 'Apenas o criador da sala pode convidar parceiros.',
        code: 'forbidden',
      }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  const grant = mapGrantPayload(data as GrantRoomAccessPayload | null)
  if (!grant) {
    return { ok: false, message: 'Não foi possível liberar o acesso à sala.' }
  }

  return {
    ok: true,
    data: grant,
    alreadyGranted: Boolean((data as GrantRoomAccessPayload | null)?.already_granted),
  }
}

export async function acceptRoomAccessSupabase(
  roomId: string,
): Promise<RoomAccessResult<RoomAccessGrant>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase.rpc('accept_room_access', {
    p_room_id: roomId,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[roomAccess accept]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapRoomQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  const payload = data as AcceptRoomAccessPayload | null
  if (!payload?.ok) {
    return { ok: false, message: 'Convite não encontrado ou já expirado.' }
  }

  const grant = mapGrantPayload(payload)
  if (!grant) {
    return { ok: false, message: 'Não foi possível aceitar o convite.' }
  }

  return { ok: true, data: grant }
}

export async function listRoomAccessSupabase(
  roomId: string,
): Promise<RoomAccessResult<RoomAccessGrant[]>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('room_access')
    .select('room_id, user_id, created_at, accepted_at, profiles(username, avatar_url)')
    .eq('room_id', roomId)

  if (error) {
    if (import.meta.env.DEV) console.error('[roomAccess list]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapRoomQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  const rows = (data ?? []) as unknown as RoomAccessRow[]
  return { ok: true, data: rows.map(mapAccessRow) }
}

export async function revokeRoomAccessSupabase(
  roomId: string,
  userId: string,
): Promise<RoomAccessResult<void>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { error } = await supabase
    .from('room_access')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) {
    if (import.meta.env.DEV) console.error('[roomAccess revoke]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapRoomQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  return { ok: true, data: undefined }
}

export function isActiveRoomAccessGrant(grant: RoomAccessGrant): boolean {
  return isAccessGrantActive(grant.grantedAt, grant.acceptedAt)
}
