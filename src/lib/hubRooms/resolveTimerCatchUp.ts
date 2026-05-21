import { getCyclePosition, type RoomCycleConfig } from '@/lib/roomTimer'
import { timerPayloadToCycleConfig } from './utils'
import type { RoomTimerPayload, RoomTimerStatus } from './types'
import { ROOM_PREP_SECONDS } from './types'

const MAX_CATCH_UP_STEPS = 10_000

export function timerStatesEqual(a: RoomTimerPayload, b: RoomTimerPayload): boolean {
  return (
    a.status === b.status &&
    a.started_at === b.started_at &&
    a.focus_sec === b.focus_sec &&
    a.break_sec === b.break_sec
  )
}

function toNowMs(now: Date | number): number {
  return typeof now === 'number' ? now : now.getTime()
}

function advanceCompletedSegment(
  status: Exclude<RoomTimerStatus, 'idle'>,
  startedAt: string,
  config: RoomCycleConfig,
  nowMs: number,
): { status: Exclude<RoomTimerStatus, 'idle'>; startedAt: string; done: boolean } {
  const { isComplete, segmentDuration } = getCyclePosition(
    nowMs,
    startedAt,
    status,
    config,
  )
  if (!isComplete) {
    return { status, startedAt, done: true }
  }

  const startMs = new Date(startedAt).getTime()
  if (!Number.isFinite(startMs)) {
    return { status, startedAt, done: true }
  }

  const nextStartMs = startMs + segmentDuration * 1000
  const nextStartedAt = new Date(nextStartMs).toISOString()
  const nextStatus = status === 'focus' ? 'break' : 'focus'
  return { status: nextStatus, startedAt: nextStartedAt, done: false }
}

/**
 * Derives wall-clock timer state from persisted payload (idle prep + focus/break cycle).
 * Presence is not required; used for display and one-shot DB sync.
 */
export function resolveTimerCatchUp(
  state: RoomTimerPayload,
  now: Date | number = Date.now(),
): { resolved: RoomTimerPayload; changed: boolean } {
  const nowMs = toNowMs(now)
  const config = timerPayloadToCycleConfig(state)

  let status = state.status
  let started_at = state.started_at

  if (status === 'idle') {
    if (!started_at) {
      return { resolved: state, changed: false }
    }
    const prepStartMs = new Date(started_at).getTime()
    if (!Number.isFinite(prepStartMs)) {
      return { resolved: state, changed: false }
    }
    const prepEndMs = prepStartMs + ROOM_PREP_SECONDS * 1000
    if (nowMs < prepEndMs) {
      return { resolved: state, changed: false }
    }
    status = 'focus'
    started_at = new Date(prepEndMs).toISOString()
  }

  if (status === 'idle' || !started_at) {
    return { resolved: state, changed: false }
  }

  let steps = 0
  while (steps < MAX_CATCH_UP_STEPS) {
    steps += 1
    const step = advanceCompletedSegment(status, started_at, config, nowMs)
    status = step.status
    started_at = step.startedAt
    if (step.done) break
  }

  const resolved: RoomTimerPayload = {
    status,
    started_at,
    focus_sec: state.focus_sec,
    break_sec: state.break_sec,
  }

  return {
    resolved,
    changed: !timerStatesEqual(state, resolved),
  }
}
