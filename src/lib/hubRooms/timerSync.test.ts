import { describe, expect, it } from 'vitest'
import { getCyclePosition } from '@/lib/roomTimer'
import { resolveTimerCatchUp } from './resolveTimerCatchUp'
import { nextFocusTimerState, nextAdvancedTimerState } from './timerMutations'
import type { RoomTimerPayload, StudyRoom } from './types'
import { ROOM_PREP_SECONDS } from './types'

const t0 = new Date('2026-05-16T12:00:00.000Z')

function baseRoom(timer: RoomTimerPayload): StudyRoom {
  return {
    id: 'room-1',
    hub_slug: 'trt',
    name: 'Tema • 25/5',
    focus_cycle: '25/5',
    is_private: false,
    creator_id: 'u1',
    current_timer_state: timer,
    present_count: 2,
    empty_since: null,
    created_at: t0.toISOString(),
  }
}

describe('timer sync between clients', () => {
  it('same payload and now yield identical remainingSeconds', () => {
    const startedAt = new Date(t0.getTime() - 10 * 60 * 1000).toISOString()
    const payload: RoomTimerPayload = {
      status: 'focus',
      started_at: startedAt,
      focus_sec: 1500,
      break_sec: 300,
    }
    const config = { focusSec: 1500, breakSec: 300 }

    const a = getCyclePosition(
      t0,
      resolveTimerCatchUp(payload, t0).resolved.started_at!,
      'focus',
      config,
    ).remainingSeconds
    const b = getCyclePosition(
      t0,
      resolveTimerCatchUp(payload, t0).resolved.started_at!,
      'focus',
      config,
    ).remainingSeconds

    expect(a).toBe(b)
    expect(a).toBe(1500 - 10 * 60)
  })

  it('nextFocusTimerState uses prep boundary not wall now', () => {
    const prepStart = new Date(t0.getTime() - 90 * 1000).toISOString()
    const room = baseRoom({
      status: 'idle',
      started_at: prepStart,
      focus_sec: 1500,
      break_sec: 300,
    })
    const next = nextFocusTimerState(room, t0)
    expect(next).not.toBeNull()
    const prepEndMs = new Date(prepStart).getTime() + ROOM_PREP_SECONDS * 1000
    expect(next!.started_at).toBe(new Date(prepEndMs).toISOString())
    expect(next!.started_at).not.toBe(t0.toISOString())
  })

  it('nextAdvancedTimerState uses segment boundary when catch-up is null', () => {
    const focusStart = new Date(t0.getTime() - 26 * 60 * 1000).toISOString()
    const room = baseRoom({
      status: 'focus',
      started_at: focusStart,
      focus_sec: 1500,
      break_sec: 300,
      cycle_count: 0,
    })
    const next = nextAdvancedTimerState(room, t0)
    expect(next?.status).toBe('break')
    const boundaryMs = new Date(focusStart).getTime() + 1500 * 1000
    expect(next?.started_at).toBe(new Date(boundaryMs).toISOString())
  })
})
