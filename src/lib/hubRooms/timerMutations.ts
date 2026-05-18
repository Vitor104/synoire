import { toPersistedTimer } from './mapRoomRow'
import type { PersistedTimerState, StudyRoom } from './types'

export function nextFocusTimerState(room: StudyRoom): PersistedTimerState | null {
  const ts = room.current_timer_state
  if (ts.status !== 'idle') return null
  const now = new Date().toISOString()
  return toPersistedTimer(
    {
      ...ts,
      status: 'focus',
      started_at: now,
    },
    room.focus_cycle,
  )
}

export function nextAdvancedTimerState(room: StudyRoom): PersistedTimerState | null {
  const ts = room.current_timer_state
  if (ts.status === 'idle' || !ts.started_at) return null
  const now = new Date().toISOString()
  if (ts.status === 'focus') {
    return toPersistedTimer(
      {
        ...ts,
        status: 'break',
        started_at: now,
      },
      room.focus_cycle,
    )
  }
  return toPersistedTimer(
    {
      ...ts,
      status: 'focus',
      started_at: now,
    },
    room.focus_cycle,
  )
}
