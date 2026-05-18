export type GoalPeriod = 'weekly' | 'monthly'

export type UserGoalRow = {
  id: string
  user_id: string
  hub_id: string | null
  subject_name: string
  target_minutes: number
  period: GoalPeriod | null
  created_at?: string | null
  updated_at?: string | null
  hubs?: { name: string } | { name: string }[] | null
}

export type UserGoalView = {
  id: string
  hubId: string | null
  hubName: string
  subjectName: string
  targetHours: number
  currentHours: number
  period: GoalPeriod
  periodLabel: string
}

export type CreateUserGoalInput = {
  hubId: string
  subjectName: string
  targetMinutes: number
  period: GoalPeriod
}

export type GoalsResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: 'forbidden' }

export const SUBJECT_NAME_MIN = 2
export const SUBJECT_NAME_MAX = 120
