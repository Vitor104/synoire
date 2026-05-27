import { isDemoMode } from '@/lib/hubRooms/demo'
import { getRoomById } from '@/lib/hubRooms/getRoomById'
import { mockHubRoomsAdapter } from '@/lib/hubRooms/mockHubRoomsAdapter'
import type { StudyRoom } from '@/lib/hubRooms/types'
import { isAccessGrantActive } from '@/lib/accessInvites/constants'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { hasRoomAccess as hasLocalAccess } from './storage'

async function fetchRoom(roomId: string): Promise<StudyRoom | null> {
  if (!isSupabaseConfigured || isDemoMode) {
    return mockHubRoomsAdapter.getRoom(roomId)
  }
  const result = await getRoomById(roomId)
  if (!result.ok) {
    throw Object.assign(new Error(result.message), { code: result.code })
  }
  return result.data
}

export type CanJoinRoomStatus =
  | 'allowed'
  | 'denied_private'
  | 'not_found'
  | 'error'

export type CanJoinRoomResult =
  | { status: 'allowed' }
  | { status: 'denied_private' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

async function userHasRoomAccessGrant(
  roomId: string,
  userId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return hasLocalAccess(roomId, userId)
  }

  const supabase = getSupabase()
  if (!supabase) return hasLocalAccess(roomId, userId)

  const { data, error } = await supabase
    .from('room_access')
    .select('room_id, created_at, accepted_at')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[canJoinRoom grant check]', error)
    return false
  }

  if (!data?.created_at) return false
  return isAccessGrantActive(data.created_at, data.accepted_at)
}

function userIsRoomCreator(room: StudyRoom, userId: string): boolean {
  return room.creator_id === userId
}

async function fetchRoomCreatorId(roomId: string): Promise<string | null> {
  if (!isSupabaseConfigured || isDemoMode) {
    const room = await mockHubRoomsAdapter.getRoom(roomId)
    return room?.creator_id ?? null
  }

  const supabase = getSupabase()
  if (!supabase) {
    const room = await mockHubRoomsAdapter.getRoom(roomId)
    return room?.creator_id ?? null
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('creator_id')
    .eq('id', roomId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[canJoinRoom creator check]', error)
    return null
  }

  return data?.creator_id ?? null
}

export async function canJoinRoom(
  roomId: string,
  userId: string,
): Promise<CanJoinRoomResult> {
  if (!roomId.trim() || !userId.trim()) {
    return { status: 'not_found' }
  }

  const hasGrant = await userHasRoomAccessGrant(roomId, userId)

  try {
    const room = await fetchRoom(roomId)
    if (!room) {
      if (hasGrant) return { status: 'allowed' }
      return { status: 'not_found' }
    }
    if (!room.is_private || hasGrant || userIsRoomCreator(room, userId)) {
      return { status: 'allowed' }
    }
    return { status: 'denied_private' }
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'forbidden') {
      if (hasGrant) return { status: 'allowed' }
      const creatorId = await fetchRoomCreatorId(roomId)
      if (creatorId === userId) return { status: 'allowed' }
      return { status: 'denied_private' }
    }
    const message = err instanceof Error ? err.message : 'Não foi possível verificar a sala.'
    return { status: 'error', message }
  }
}
