import { describe, expect, it } from 'vitest'
import { getCyclePosition } from '@/lib/roomTimer'
import { catchUpTimerState } from './timerMutations'
import type { StudyRoom } from './types'

const t0 = new Date('2026-05-16T12:00:00.000Z')

function room(overrides: Partial<StudyRoom> = {}): StudyRoom {
  return {
    id: 'room-1',
    hub_slug: 'trt',
    name: 'Tema • 25/5',
    focus_cycle: '25/5',
    is_private: false,
    creator_id: 'u1',
    current_timer_state: {
      status: 'focus',
      started_at: new Date(t0.getTime() - 30 * 60 * 1000).toISOString(),
      focus_sec: 1500,
      break_sec: 300,
    },
    present_count: 0,
    empty_since: null,
    created_at: t0.toISOString(),
    ...overrides,
  }
}

describe('catchUpTimerState', () => {
  it('returns persisted state when stale focus elapsed (empty room catch-up)', () => {
    const next = catchUpTimerState(room(), t0)
    expect(next).not.toBeNull()
    expect(next!.status).toBe('focus')
    const { remainingSeconds, isComplete } = getCyclePosition(
      t0,
      next!.started_at!,
      'focus',
      { focusSec: 1500, breakSec: 300 },
    )
    expect(isComplete).toBe(false)
    expect(remainingSeconds).toBeGreaterThan(0)
  })

  it('returns null when timer is current', () => {
    const startedAt = new Date(t0.getTime() - 5 * 60 * 1000).toISOString()
    const next = catchUpTimerState(
      room({
        current_timer_state: {
          status: 'focus',
          started_at: startedAt,
          focus_sec: 1500,
          break_sec: 300,
        },
      }),
      t0,
    )
    expect(next).toBeNull()
  })
})
