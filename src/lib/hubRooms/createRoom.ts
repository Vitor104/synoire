import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isForbiddenError, mapRoomQueryError } from './errors'
import { mapRoomRow } from './mapRoomRow'
import { stripHubJoin, type RoomRowWithHub } from './parseRoomRow'
import type { CreateRoomInput, RoomsResult, StudyRoom } from './types'
import { buildIdleTimerState, buildRoomName, validateTheme } from './utils'

export async function createRoomApi(
  input: CreateRoomInput,
): Promise<RoomsResult<StudyRoom>> {
  const validation = validateTheme(input.theme)
  if (!validation.ok) {
    return { ok: false, message: validation.error }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const isPrivate = input.isPrivate ?? false
  const timerState = buildIdleTimerState(input.focusCycle)

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      hub_id: input.hubId,
      name: buildRoomName(validation.value, input.focusCycle),
      is_private: isPrivate,
      creator_id: input.creatorId,
      current_timer_state: timerState,
    })
    .select('*, hubs(slug)')
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[hubRooms createRoom]', error)
    if (isForbiddenError(error)) {
      return {
        ok: false,
        message: 'Salas privadas são exclusivas do plano Glow.',
        code: 'forbidden',
      }
    }
    return { ok: false, message: mapRoomQueryError(error.message) }
  }

  const row = data as unknown as RoomRowWithHub
  const room = mapRoomRow(stripHubJoin(row), input.hubSlug)
  return { ok: true, data: room }
}
