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

export function dateKeyInTz(date: Date, timeZone: string = STUDY_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function yearInTz(date: Date, timeZone: string = STUDY_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
  }).formatToParts(date)
  return Number(parts.find((p) => p.type === 'year')?.value ?? '1970')
}

export function hourInTz(date: Date, timeZone: string = STUDY_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  return hour === 24 ? 0 : hour
}

export function dayOfWeekInTz(date: Date, timeZone: string = STUDY_TIMEZONE): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(date)
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return map[weekday] ?? 0
}

function parseDateKeyUtc(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00.000Z`)
}

function addDaysUtc(dateKey: string, days: number): string {
  const d = parseDateKeyUtc(dateKey)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetweenDateKeys(startKey: string, endKey: string): number {
  const start = parseDateKeyUtc(startKey).getTime()
  const end = parseDateKeyUtc(endKey).getTime()
  return Math.round((end - start) / 86_400_000)
}

export function hasSessionOnDateKey(
  sessions: StudySessionPoint[],
  dateKey: string,
  timeZone: string = STUDY_TIMEZONE,
): boolean {
  return sessions.some((s) => dateKeyInTz(s.startedAt, timeZone) === dateKey)
}

export function hasSessionToday(
  sessions: StudySessionPoint[],
  timeZone: string = STUDY_TIMEZONE,
  now: Date = new Date(),
): boolean {
  const todayKey = dateKeyInTz(now, timeZone)
  return hasSessionOnDateKey(sessions, todayKey, timeZone)
}

export function msUntilMidnightInTz(
  timeZone: string = STUDY_TIMEZONE,
  now: Date = new Date(),
): number {
  const todayKey = dateKeyInTz(now, timeZone)
  let low = now.getTime()
  let high = now.getTime() + 36 * 3_600_000

  while (high - low > 1000) {
    const mid = Math.floor((low + high) / 2)
    if (dateKeyInTz(new Date(mid), timeZone) === todayKey) {
      low = mid
    } else {
      high = mid
    }
  }

  return Math.max(0, high - now.getTime())
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
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

/** @deprecated Use buildYearHeatmap for dashboard heatmap */
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

export type YearHeatmapCell = {
  dateKey: string
  weekIndex: number
  dayOfWeek: number
  minutes: number
  intensity: number
}

export type YearHeatmapMonthLabel = {
  weekIndex: number
  label: string
}

const MONTH_LABELS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const

export function buildYearHeatmap(
  sessions: StudySessionPoint[],
  year?: number,
  timeZone = STUDY_TIMEZONE,
  now: Date = new Date(),
): YearHeatmapCell[] {
  const targetYear = year ?? yearInTz(now, timeZone)

  const minutesByDay = new Map<string, number>()
  for (const session of sessions) {
    if (yearInTz(session.startedAt, timeZone) !== targetYear) continue
    const key = dateKeyInTz(session.startedAt, timeZone)
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.durationMinutes)
  }

  const jan1Key = `${targetYear}-01-01`
  const dec31Key = `${targetYear}-12-31`
  const todayKey = dateKeyInTz(now, timeZone)
  const endKey =
    yearInTz(now, timeZone) === targetYear ? (
      todayKey < dec31Key ? todayKey : dec31Key
    ) : dec31Key

  const jan1Date = parseDateKeyUtc(jan1Key)
  const jan1Dow = dayOfWeekInTz(jan1Date, timeZone)

  const cells: YearHeatmapCell[] = []
  let cursorKey = jan1Key

  while (cursorKey <= endKey) {
    const cursorDate = parseDateKeyUtc(cursorKey)
    const minutes = minutesByDay.get(cursorKey) ?? 0
    const daysSinceJan1 = daysBetweenDateKeys(jan1Key, cursorKey)
    const dayOfWeek = dayOfWeekInTz(cursorDate, timeZone)
    const weekIndex = Math.floor((daysSinceJan1 + jan1Dow) / 7)

    cells.push({
      dateKey: cursorKey,
      weekIndex,
      dayOfWeek,
      minutes,
      intensity: minutes,
    })

    cursorKey = addDaysUtc(cursorKey, 1)
  }

  const maxMinutes = Math.max(1, ...cells.map((c) => c.minutes))
  return cells.map((c) => ({
    ...c,
    intensity:
      c.minutes === 0 ? 0 : (
        Math.min(4, Math.ceil((c.minutes / maxMinutes) * 4))
      ),
  }))
}

export function getYearHeatmapWeekCount(cells: YearHeatmapCell[]): number {
  if (cells.length === 0) return 0
  return Math.max(...cells.map((c) => c.weekIndex)) + 1
}

export function buildYearHeatmapMonthLabels(
  cells: YearHeatmapCell[],
): YearHeatmapMonthLabel[] {
  const labels: YearHeatmapMonthLabel[] = []
  let lastMonth = -1

  for (const cell of cells) {
    const month = Number(cell.dateKey.slice(5, 7)) - 1
    if (month !== lastMonth) {
      labels.push({
        weekIndex: cell.weekIndex,
        label: MONTH_LABELS_SHORT[month] ?? '',
      })
      lastMonth = month
    }
  }

  return labels
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
