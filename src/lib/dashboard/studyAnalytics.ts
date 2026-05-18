import type { GoalPeriod } from '@/lib/goals/types'
import type { StudySessionView } from '@/lib/studySessions'

export const STUDY_TIMEZONE = 'America/Sao_Paulo'

export type StudySessionPoint = {
  startedAt: Date
  durationMinutes: number
}

export function toSessionPoints(sessions: StudySessionView[]): StudySessionPoint[] {
  return sessions.map((s) => ({
    startedAt: s.startedAt,
    durationMinutes: s.durationMinutes,
  }))
}

function dateKeyInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function minutesStudiedToday(
  sessions: StudySessionPoint[],
  timeZone = STUDY_TIMEZONE,
): number {
  const todayKey = dateKeyInTz(new Date(), timeZone)
  return sessions
    .filter((s) => dateKeyInTz(s.startedAt, timeZone) === todayKey)
    .reduce((sum, s) => sum + s.durationMinutes, 0)
}

export function formatStudyHours(minutes: number): string {
  if (minutes <= 0) return '0h'
  const hours = minutes / 60
  if (hours < 1) return `${Math.round(minutes)}min`
  if (Number.isInteger(hours)) return `${hours}h`
  return `${hours.toFixed(1)}h`
}

export function minutesStudiedLast7Days(
  sessions: StudySessionPoint[],
  timeZone = STUDY_TIMEZONE,
): number {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - 6)
  const cutoffKey = dateKeyInTz(cutoff, timeZone)

  return sessions
    .filter((s) => dateKeyInTz(s.startedAt, timeZone) >= cutoffKey)
    .reduce((sum, s) => sum + s.durationMinutes, 0)
}

export type WeeklyBar = {
  label: string
  minutes: number
  percent: number
}

export function buildWeeklyBars(
  sessions: StudySessionPoint[],
  timeZone = STUDY_TIMEZONE,
): WeeklyBar[] {
  const now = new Date()
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const buckets: { date: Date; minutes: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d, minutes: 0 })
  }

  for (const session of sessions) {
    const key = dateKeyInTz(session.startedAt, timeZone)
    const bucket = buckets.find((b) => dateKeyInTz(b.date, timeZone) === key)
    if (bucket) bucket.minutes += session.durationMinutes
  }

  const maxMinutes = Math.max(1, ...buckets.map((b) => b.minutes))

  return buckets.map((b) => ({
    label: dayLabels[b.date.getDay()] ?? '',
    minutes: b.minutes,
    percent: Math.round((b.minutes / maxMinutes) * 100),
  }))
}

export type HeatmapCell = {
  dateKey: string
  intensity: number
}

export function buildHeatmap(
  sessions: StudySessionPoint[],
  weeks: number,
  daysPerWeek: number,
  timeZone = STUDY_TIMEZONE,
): HeatmapCell[] {
  const totalCells = weeks * daysPerWeek
  const now = new Date()
  const cells: HeatmapCell[] = []

  const minutesByDay = new Map<string, number>()
  for (const session of sessions) {
    const key = dateKeyInTz(session.startedAt, timeZone)
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.durationMinutes)
  }

  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateKey = dateKeyInTz(d, timeZone)
    const minutes = minutesByDay.get(dateKey) ?? 0
    cells.push({ dateKey, intensity: minutes })
  }

  const maxMinutes = Math.max(1, ...cells.map((c) => c.intensity))
  return cells.map((c) => ({
    ...c,
    intensity: c.intensity === 0 ? 0 : Math.min(4, Math.ceil((c.intensity / maxMinutes) * 4)),
  }))
}

function weekStartKey(now: Date, timeZone: string): string {
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() - i * 86_400_000)
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
    }).format(d)
    if (weekday === 'Monday') return dateKeyInTz(d, timeZone)
  }
  return dateKeyInTz(now, timeZone)
}

function monthStartKey(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970'
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  return `${year}-${month}-01`
}

export function isSessionInGoalPeriod(
  session: StudySessionView,
  period: GoalPeriod,
  timeZone = STUDY_TIMEZONE,
): boolean {
  const sessionKey = dateKeyInTz(session.startedAt, timeZone)
  const now = new Date()

  if (period === 'weekly') {
    return sessionKey >= weekStartKey(now, timeZone)
  }

  return sessionKey >= monthStartKey(now, timeZone)
}

export function minutesForGoal(
  sessions: StudySessionView[],
  hubId: string | null,
  period: GoalPeriod,
): number {
  if (!hubId) return 0
  return sessions
    .filter(
      (s) =>
        s.hubId === hubId &&
        isSessionInGoalPeriod(s, period),
    )
    .reduce((sum, s) => sum + s.durationMinutes, 0)
}

export function computeStreakFromSessions(
  sessions: StudySessionPoint[],
  timeZone = STUDY_TIMEZONE,
): number {
  const dayKeys = new Set(
    sessions.map((s) => dateKeyInTz(s.startedAt, timeZone)),
  )
  if (dayKeys.size === 0) return 0

  let streak = 0
  const cursor = new Date()
  for (let i = 0; i < 400; i++) {
    const key = dateKeyInTz(cursor, timeZone)
    if (dayKeys.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
