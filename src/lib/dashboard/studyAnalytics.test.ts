import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StudySessionView } from '@/lib/studySessions'
import {
  buildHeatmap,
  buildWeeklyBars,
  minutesForGoal,
  minutesStudiedToday,
  toSessionPoints,
} from './studyAnalytics'

afterEach(() => {
  vi.useRealTimers()
})

function session(
  iso: string,
  minutes: number,
  hubId: string | null = 'hub-1',
): StudySessionView {
  return {
    id: `s-${iso}`,
    roomId: 'room-1',
    hubId,
    durationMinutes: minutes,
    startedAt: new Date(iso),
  }
}

describe('minutesStudiedToday', () => {
  it('sums only sessions on the same calendar day in São Paulo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17T18:00:00.000Z'))
    const points = toSessionPoints([
      session('2026-05-17T15:00:00.000Z', 25),
      session('2026-05-16T15:00:00.000Z', 50),
    ])
    expect(minutesStudiedToday(points)).toBe(25)
    vi.useRealTimers()
  })
})

describe('buildWeeklyBars', () => {
  it('returns seven buckets', () => {
    const bars = buildWeeklyBars([])
    expect(bars).toHaveLength(7)
  })
})

describe('buildHeatmap', () => {
  it('returns weeks * days cells', () => {
    const cells = buildHeatmap([], 4, 7)
    expect(cells).toHaveLength(28)
  })
})

describe('minutesForGoal', () => {
  it('sums sessions for hub in weekly period', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17T18:00:00.000Z'))
    const sessions = [
      session('2026-05-17T10:00:00.000Z', 60, 'hub-a'),
      session('2026-05-17T11:00:00.000Z', 30, 'hub-b'),
    ]
    expect(minutesForGoal(sessions, 'hub-a', 'weekly')).toBe(60)
    vi.useRealTimers()
  })
})
