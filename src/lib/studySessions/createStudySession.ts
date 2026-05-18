import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { createDemoStudySession, isDemoMode } from './demo'
import { mapStudySessionsCreateError } from './errors'
import { mapStudySessionRow } from './mapStudySessionRow'
import type {
  CreateStudySessionInput,
  StudySessionRow,
  StudySessionView,
  StudySessionsResult,
} from './types'

export async function createStudySession(
  userId: string,
  input: CreateStudySessionInput,
): Promise<StudySessionsResult<StudySessionView>> {
  if (isDemoMode) {
    return { ok: true, data: createDemoStudySession(userId, input) }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      room_id: input.roomId,
      duration_minutes: input.durationMinutes,
    })
    .select('*, rooms(hub_id)')
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[studySessions createStudySession]', error)
    return { ok: false, message: mapStudySessionsCreateError(error.message) }
  }

  if (!data) {
    return { ok: false, message: 'Não foi possível registrar a sessão. Tente novamente.' }
  }

  return { ok: true, data: mapStudySessionRow(data as StudySessionRow) }
}
