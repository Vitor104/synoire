import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isForbiddenError, mapRoomQueryError } from './errors'
import { mapRoomRow } from './mapRoomRow'
import { resolveHubSlug, stripHubJoin, type RoomRowWithHub } from './parseRoomRow'
import type { RoomsResult, StudyRoom } from './types'

export async function getRoomById(roomId: string): Promise<RoomsResult<StudyRoom | null>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('*, hubs(slug)')
    .eq('id', roomId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[hubRooms getRoomById]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapRoomQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  if (!data) {
    return { ok: true, data: null }
  }

  const row = data as unknown as RoomRowWithHub
  const hubSlug = resolveHubSlug(row, '')
  return { ok: true, data: mapRoomRow(stripHubJoin(row), hubSlug) }
}
