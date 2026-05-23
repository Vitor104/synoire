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

  const { data: sessionData } = await supabase.auth.getSession()
  // #region agent log
  fetch('http://127.0.0.1:7355/ingest/d6106c7d-b1bd-4a41-bd9b-f9b65c9695ca',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e17dc1'},body:JSON.stringify({sessionId:'e17dc1',location:'listUserGoals.ts:before-query',message:'listUserGoals client session',data:{userId,hasClientAccessToken:Boolean(sessionData.session?.access_token),clientUserId:sessionData.session?.user?.id??null,userIdMatch:sessionData.session?.user?.id===userId},timestamp:Date.now(),hypothesisId:'A,E,I'})}).catch(()=>{});
  // #endregion

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
