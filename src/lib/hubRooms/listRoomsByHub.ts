import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isForbiddenError, mapRoomQueryError } from './errors'
import { mapRoomRow } from './mapRoomRow'
import { resolveHubSlug, stripHubJoin, type RoomRowWithHub } from './parseRoomRow'
import type { RoomsResult, StudyRoom } from './types'

export async function listRoomsByHub(
  hubId: string,
  hubSlug: string,
): Promise<RoomsResult<StudyRoom[]>> {
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
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })

  if (error) {
    if (import.meta.env.DEV) console.error('[hubRooms listRoomsByHub]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapRoomQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  const rows = (data ?? []) as unknown as RoomRowWithHub[]
  const rooms = rows.map((row) => {
    const slug = resolveHubSlug(row, hubSlug)
    return mapRoomRow(stripHubJoin(row), slug)
  })

  return { ok: true, data: rooms }
}
