import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode, listDemoStudySessions } from './demo'
import { mapStudySessionsQueryError } from './errors'
import { mapStudySessionRow } from './mapStudySessionRow'
import type { StudySessionRow, StudySessionView, StudySessionsResult } from './types'

export async function listUserStudySessions(
  userId: string,
): Promise<StudySessionsResult<StudySessionView[]>> {
  if (isDemoMode) {
    return { ok: true, data: listDemoStudySessions(userId) }
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
    .select('*, rooms(hub_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    if (import.meta.env.DEV) console.error('[studySessions listUserStudySessions]', error)
    return { ok: false, message: mapStudySessionsQueryError(error.message) }
  }

  const sessions = ((data as StudySessionRow[] | null) ?? []).map(mapStudySessionRow)
  return { ok: true, data: sessions }
}
