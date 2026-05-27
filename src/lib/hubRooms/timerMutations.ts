import { advanceTimerOnSegmentComplete } from './advanceTimerSegment'
export { advanceTimerOnSegmentComplete } from './advanceTimerSegment'
import { toPersistedTimer } from './mapRoomRow'
import { resolveTimerCatchUp, resolveTimerForPersist } from './resolveTimerCatchUp'
import { getCyclePosition, type RoomPhase } from '@/lib/roomTimer'
import { timerPayloadToCycleConfig } from './utils'
import type { PersistedTimerState, RoomTimerPayload, RoomTimerStatus, StudyRoom } from './types'

/** Wall-clock catch-up; null if persisted state is already current. */
export function catchUpTimerState(
  room: StudyRoom,
  now: Date | number = Date.now(),
): PersistedTimerState | null {
  const { resolved, changed } = resolveTimerCatchUp(room.current_timer_state, now)
  if (!changed) return null
  return toPersistedTimer(resolved, room.focus_cycle)
}

function segmentBoundaryStartedAt(
  ts: RoomTimerPayload,
  phase: RoomPhase,
  now: Date | number,
): string | null {
  const config = timerPayloadToCycleConfig(ts)
  const startedAt = ts.started_at
  if (!startedAt) return null
  const { isComplete, segmentDuration } = getCyclePosition(now, startedAt, phase, config)
  if (!isComplete) return null
  const startMs = new Date(startedAt).getTime()
  if (!Number.isFinite(startMs)) return null
  return new Date(startMs + segmentDuration * 1000).toISOString()
}

export function nextFocusTimerState(
  room: StudyRoom,
  now: Date | number = Date.now(),
): PersistedTimerState | null {
  const ts = room.current_timer_state
  if (ts.status !== 'idle') return null
  const resolved = resolveTimerForPersist(ts, now)
  if (resolved.status !== 'focus') return null
  return toPersistedTimer(resolved, room.focus_cycle)
}

export function nextAdvancedTimerState(
  room: StudyRoom,
  now: Date | number = Date.now(),
): PersistedTimerState | null {
  const caught = catchUpTimerState(room, now)
  if (caught) return caught

  const ts = room.current_timer_state
  if (ts.status === 'idle' || !ts.started_at) return null
  const advanced = advanceTimerOnSegmentComplete(ts)
  if (!advanced) return null

  const phase = ts.status as Exclude<RoomTimerStatus, 'idle'>
  const nextStartedAt = segmentBoundaryStartedAt(ts, phase, now)
  if (!nextStartedAt) return null

  return toPersistedTimer({ ...advanced, started_at: nextStartedAt }, room.focus_cycle)
}
