import type { GoalPeriod, UserGoalRow, UserGoalView } from './types'

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
}

function extractHubName(row: UserGoalRow): string {
  const nested = row.hubs
  if (!nested) return 'Hub'
  if (Array.isArray(nested)) return nested[0]?.name ?? 'Hub'
  return nested.name ?? 'Hub'
}

export function mapGoalRow(row: UserGoalRow): UserGoalView {
  const period = row.period ?? 'weekly'
  return {
    id: row.id,
    hubId: row.hub_id,
    hubName: extractHubName(row),
    subjectName: row.subject_name,
    targetHours: row.target_minutes / 60,
    currentHours: 0,
    period,
    periodLabel: PERIOD_LABELS[period] ?? period,
  }
}
