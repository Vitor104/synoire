import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getHubRoomsAdapter,
  getPrepRemainingSeconds,
  resolveTimerCatchUp,
  timerPayloadToCycleConfig,
  type StudyRoom,
} from '@/lib/hubRooms'
import {
  DEFAULT_CYCLE_CONFIG,
  getCyclePosition,
  secondsUntilNextFocus,
  type RoomCycleConfig,
  type RoomPhase,
  type RoomTimerState,
} from '@/lib/roomTimer'
import { useServerClockOffset } from '@/hooks/useServerClockOffset'

const LEADER_TTL_MS = 3000

function leaderKey(roomId: string) {
  return `synoire-timer-leader:${roomId}`
}

function tryClaimLeader(roomId: string): boolean {
  try {
    const key = leaderKey(roomId)
    const raw = sessionStorage.getItem(key)
    const now = Date.now()
    if (raw) {
      const ts = Number.parseInt(raw, 10)
      if (Number.isFinite(ts) && now - ts < LEADER_TTL_MS) return false
    }
    sessionStorage.setItem(key, String(now))
    return true
  } catch {
    return true
  }
}

const safeIdleTimerState = (): RoomTimerState & { isIdle: boolean } => ({
  phase: 'focus',
  startedAt: new Date().toISOString(),
  presentCount: 0,
  cycle: DEFAULT_CYCLE_CONFIG,
  isIdle: true,
})

function studyRoomToTimerState(
  room: StudyRoom,
  now: number,
): RoomTimerState & { isIdle: boolean } {
  const { resolved } = resolveTimerCatchUp(room.current_timer_state, now)
  const cycle = timerPayloadToCycleConfig(resolved)

  if (resolved.status === 'idle') {
    return {
      phase: 'focus',
      startedAt: resolved.started_at ?? new Date(now).toISOString(),
      presentCount: room.present_count,
      cycle,
      cycleCount: resolved.cycle_count ?? 0,
      isIdle: true,
    }
  }

  return {
    phase: resolved.status,
    startedAt: resolved.started_at!,
    presentCount: room.present_count,
    cycle,
    cycleCount: resolved.cycle_count ?? 0,
    isIdle: false,
  }
}

export function useGlobalRoomTimer(
  roomId: string | undefined,
  studyRoom: StudyRoom | null | undefined,
) {
  const id = roomId ?? ''
  const adapter = getHubRoomsAdapter()

  const useServerClock = Boolean(studyRoom && roomId)
  const serverOffsetMs = useServerClockOffset(useServerClock)

  const [localNow, setLocalNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = window.setInterval(() => setLocalNow(Date.now()), 1000)
    return () => window.clearInterval(tick)
  }, [])

  const now = localNow + serverOffsetMs

  const storedPayload = studyRoom?.current_timer_state
  const catchUp = useMemo(() => {
    if (!storedPayload) return { resolved: null as null, changed: false }
    return resolveTimerCatchUp(storedPayload, now)
  }, [storedPayload, now])

  const derived = useMemo(() => {
    if (studyRoom) return studyRoomToTimerState(studyRoom, now)
    return safeIdleTimerState()
  }, [studyRoom, now])

  const config: RoomCycleConfig = derived.cycle ?? DEFAULT_CYCLE_CONFIG
  const isIdle = derived.isIdle
  const timerPayload = catchUp.resolved ?? storedPayload

  const prepRemaining = useMemo(() => {
    if (!isIdle || !timerPayload) return null
    return getPrepRemainingSeconds(timerPayload, now)
  }, [isIdle, timerPayload, now])

  const { remainingSeconds, isComplete } = useMemo(() => {
    if (isIdle && prepRemaining !== null) {
      return {
        remainingSeconds: prepRemaining,
        isComplete: prepRemaining === 0,
      }
    }
    return getCyclePosition(now, derived.startedAt, derived.phase, config)
  }, [now, derived.startedAt, derived.phase, config, isIdle, prepRemaining])

  const untilNextFocus = useMemo(() => {
    if (isIdle && prepRemaining !== null) return prepRemaining
    return secondsUntilNextFocus(
      now,
      { phase: derived.phase, startedAt: derived.startedAt },
      config,
    )
  }, [now, derived.phase, derived.startedAt, config, isIdle, prepRemaining])

  const advancePhase = useCallback(async () => {
    if (studyRoom && roomId) {
      await adapter.advanceTimerPhase(roomId, now)
    }
  }, [studyRoom, roomId, adapter, now])

  const syncTimerCatchUp = useCallback(async () => {
    if (!studyRoom || !roomId) return
    await adapter.syncTimerCatchUp(roomId, now)
  }, [studyRoom, roomId, adapter, now])

  useEffect(() => {
    if (!studyRoom) return
    if (!catchUp.changed && !isComplete) return
    if (!tryClaimLeader(id)) return
    void syncTimerCatchUp()
  }, [
    catchUp.changed,
    isComplete,
    isIdle,
    id,
    syncTimerCatchUp,
    studyRoom,
  ])

  const presentCount = derived.presentCount ?? 0

  const cycleCount =
    catchUp.resolved?.cycle_count ??
    storedPayload?.cycle_count ??
    derived.cycleCount ??
    0

  return {
    phase: derived.phase as RoomPhase,
    remainingSeconds,
    secondsUntilNextFocus: untilNextFocus,
    startedAt: derived.startedAt,
    presentCount,
    isSegmentComplete: isComplete,
    isIdle,
    cycle: config,
    cycleCount,
    advancePhase,
  }
}
