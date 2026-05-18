import { SAMPLE_HUBS } from '@/data/sampleHubs'
import type { CreateUserGoalInput, UserGoalRow, UserGoalView } from './types'
import { mapGoalRow } from './mapGoalRow'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const DEMO_GOALS_KEY = 'synoire_demo_user_goals'

function readDemoGoals(): UserGoalRow[] {
  try {
    const raw = localStorage.getItem(DEMO_GOALS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UserGoalRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeDemoGoals(goals: UserGoalRow[]): void {
  localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(goals))
}

export function listDemoUserGoals(userId: string): UserGoalView[] {
  return readDemoGoals()
    .filter((g) => g.user_id === userId)
    .map(mapGoalRow)
}

export function createDemoUserGoal(
  userId: string,
  input: CreateUserGoalInput,
): UserGoalView {
  const slug = input.hubId.replace(/^demo-/, '')
  const hubName = SAMPLE_HUBS.find((h) => h.slug === slug)?.name ?? 'Hub'
  const row: UserGoalRow = {
    id: `demo-goal-${crypto.randomUUID()}`,
    user_id: userId,
    hub_id: input.hubId,
    subject_name: input.subjectName,
    target_minutes: input.targetMinutes,
    period: input.period,
    hubs: { name: hubName },
  }
  const goals = readDemoGoals()
  goals.push(row)
  writeDemoGoals(goals)
  return mapGoalRow(row)
}
