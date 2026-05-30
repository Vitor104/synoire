import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  isForbiddenGoalsError,
  mapGoalsCreateError,
} from './errors'
import { mapGoalRow } from './mapGoalRow'
import type { CreateUserGoalInput, GoalsResult, UserGoalRow, UserGoalView } from './types'

export async function createUserGoal(
  userId: string,
  input: CreateUserGoalInput,
): Promise<GoalsResult<UserGoalView>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('user_goals')
    .insert({
      user_id: userId,
      hub_id: input.hubId,
      subject_name: input.subjectName,
      target_minutes: input.targetMinutes,
      period: input.period,
    })
    .select('*, hubs(name)')
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[goals createUserGoal]', error)
    if (isForbiddenGoalsError(error)) {
      return {
        ok: false,
        message: 'Metas são exclusivas do plano Glow.',
        code: 'forbidden',
      }
    }
    return { ok: false, message: mapGoalsCreateError(error.message) }
  }

  if (!data) {
    return { ok: false, message: 'Não foi possível criar a meta. Tente novamente.' }
  }

  return { ok: true, data: mapGoalRow(data as UserGoalRow) }
}
