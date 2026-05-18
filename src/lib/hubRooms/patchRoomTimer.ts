import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isForbiddenError, mapRoomQueryError } from './errors'
import { mapRoomRow } from './mapRoomRow'
import { stripHubJoin, type RoomRowWithHub } from './parseRoomRow'
import type { PersistedTimerState, RoomsResult, StudyRoom } from './types'

export async function patchRoomTimer(
  roomId: string,
  timerState: PersistedTimerState,
  hubSlugFallback = '',
): Promise<RoomsResult<StudyRoom>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('rooms')
    .update({ current_timer_state: timerState })
    .eq('id', roomId)
    .select('*, hubs(slug)')
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[hubRooms patchRoomTimer]', error)
    if (isForbiddenError(error)) {
      return { ok: false, message: mapRoomQueryError(error.message), code: 'forbidden' }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  const row = data as unknown as RoomRowWithHub
  const hubSlug =
    (Array.isArray(row.hubs) ? row.hubs[0]?.slug : row.hubs?.slug) ?? hubSlugFallback
  return { ok: true, data: mapRoomRow(stripHubJoin(row), hubSlug) }
}
