import { isSupabaseConfigured } from '@/lib/supabase'
import { isAccessGrantActive } from '@/lib/accessInvites/constants'
import {
  acceptRoomAccessGrant as acceptLocal,
  grantRoomAccess as grantLocal,
  hasRoomAccess as hasLocal,
  listGrantsForRoom as listLocal,
  listGrantsForUser,
  revokeRoomAccessGrant as revokeLocal,
} from './storage'
import { listIncomingRoomInvites } from './listIncomingRoomInvites'
import {
  acceptRoomAccessSupabase,
  grantRoomAccessSupabase,
  isActiveRoomAccessGrant,
  listRoomAccessSupabase,
  revokeRoomAccessSupabase,
} from './supabaseRoomAccess'
import type { IncomingRoomInvite, RoomAccessGrant, RoomAccessResult } from './types'

export { listIncomingRoomInvites } from './listIncomingRoomInvites'
export {
  subscribeRoomAccessRealtime,
  subscribeRoomAccessStorageSync,
} from './subscribeRoomAccessRealtime'
export type { IncomingRoomInvite } from './types'

function useSupabase(): boolean {
  return isSupabaseConfigured
}

export async function grantRoomAccess(
  roomId: string,
  userId: string,
): Promise<RoomAccessResult<RoomAccessGrant>> {
  if (useSupabase()) {
    return grantRoomAccessSupabase(roomId, userId)
  }
  const grant = grantLocal(roomId, userId)
  return { ok: true, data: grant }
}

export async function acceptRoomAccess(
  roomId: string,
  userId: string,
): Promise<RoomAccessResult<RoomAccessGrant>> {
  if (useSupabase()) {
    return acceptRoomAccessSupabase(roomId)
  }
  const grant = listGrantsForUser(userId).find((g) => g.roomId === roomId)
  if (!grant || !isAccessGrantActive(grant.grantedAt, grant.acceptedAt)) {
    return { ok: false, message: 'Convite não encontrado ou já expirado.' }
  }
  const acceptedAt = new Date().toISOString()
  acceptLocal(roomId, userId)
  return {
    ok: true,
    data: { ...grant, acceptedAt },
  }
}

export async function listRoomAccess(
  roomId: string,
): Promise<RoomAccessResult<RoomAccessGrant[]>> {
  if (useSupabase()) {
    return listRoomAccessSupabase(roomId)
  }
  return { ok: true, data: listLocal(roomId) }
}

export async function revokeRoomAccess(
  roomId: string,
  userId: string,
): Promise<RoomAccessResult<void>> {
  if (useSupabase()) {
    return revokeRoomAccessSupabase(roomId, userId)
  }
  revokeLocal(roomId, userId)
  return { ok: true, data: undefined }
}

export async function fetchIncomingRoomInvites(
  userId: string,
): Promise<RoomAccessResult<IncomingRoomInvite[]>> {
  return listIncomingRoomInvites(userId)
}

export async function hasRoomAccess(roomId: string, userId: string): Promise<boolean> {
  if (useSupabase()) {
    const result = await listRoomAccessSupabase(roomId)
    if (!result.ok) return false
    return result.data.some((g) => g.userId === userId && isActiveRoomAccessGrant(g))
  }
  return hasLocal(roomId, userId)
}
