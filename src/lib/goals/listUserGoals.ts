import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode, listDemoUserGoals } from './demo'
import { mapGoalsQueryError } from './errors'
import { mapGoalRow } from './mapGoalRow'
import type { GoalsResult, UserGoalRow, UserGoalView } from './types'

export async function listUserGoals(
  userId: string,
): Promise<GoalsResult<UserGoalView[]>> {
  if (isDemoMode) {
    return { ok: true, data: listDemoUserGoals(userId) }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('user_goals')
    .select('*, hubs(name)')
    .eq('user_id', userId)

  if (error) {
    if (import.meta.env.DEV) console.error('[goals listUserGoals]', error)
    return { ok: false, message: mapGoalsQueryError(error.message) }
  }

  const goals = ((data as UserGoalRow[] | null) ?? []).map(mapGoalRow)
  return { ok: true, data: goals }
}
