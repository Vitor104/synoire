import { describe, expect, it } from 'vitest'
import { inferFocusCycle, mapRoomRow } from './mapRoomRow'
import type { RoomRow } from './types'

describe('inferFocusCycle', () => {
  it('maps 50/10 durations', () => {
    expect(inferFocusCycle(3000, 600)).toBe('50/10')
  })

  it('defaults unknown durations to 25/5', () => {
    expect(inferFocusCycle(999, 999)).toBe('25/5')
  })
})

describe('mapRoomRow', () => {
  it('maps DB row to StudyRoom', () => {
    const row: RoomRow = {
      id: 'r1',
      hub_id: 'h1',
      name: 'Direito • 25/5',
      is_private: false,
      creator_id: 'u1',
      created_at: '2026-05-16T12:00:00.000Z',
      current_timer_state: {
        status: 'idle',
        started_at: '2026-05-16T12:00:00.000Z',
        focus_sec: 1500,
        break_sec: 300,
        focus_cycle: '25/5',
      },
    }
    const room = mapRoomRow(row, 'trt', { present_count: 3, empty_since: null })
    expect(room.hub_slug).toBe('trt')
    expect(room.focus_cycle).toBe('25/5')
    expect(room.creator_id).toBe('u1')
    expect(room.present_count).toBe(3)
    expect(room.current_timer_state.status).toBe('idle')
    expect(room.current_timer_state).not.toHaveProperty('focus_cycle')
  })

  it('infers focus_cycle when missing in JSONB', () => {
    const row: RoomRow = {
      id: 'r2',
      hub_id: 'h1',
      name: 'Long • 90/15',
      is_private: true,
      creator_id: 'u2',
      created_at: '2026-05-16T12:00:00.000Z',
      current_timer_state: {
        status: 'focus',
        started_at: '2026-05-16T12:00:00.000Z',
        focus_sec: 5400,
        break_sec: 900,
        focus_cycle: '90/15',
      },
    }
    const room = mapRoomRow(row, 'pf')
    expect(room.focus_cycle).toBe('90/15')
  })
})
