import { getCycleDurations } from '@/lib/hubRooms/cycles'
import type { FocusCycle } from '@/lib/hubRooms/types'
import { ROOM_PREP_SECONDS } from '@/lib/hubRooms/types'
import type { RoomCycleConfig } from '@/lib/roomTimer'

export const isE2eTestMode = import.meta.env.VITE_E2E_TEST_MODE === 'true'

export const E2E_SEGMENT_SEC = 1
export const E2E_PREP_SECONDS = 0
export const E2E_RECORD_FOCUS_MINUTES = 25

export function getEffectiveCycleDurations(
  focusSec: number,
  breakSec: number,
): RoomCycleConfig {
  if (isE2eTestMode) {
    return { focusSec: E2E_SEGMENT_SEC, breakSec: E2E_SEGMENT_SEC }
  }
  return { focusSec, breakSec }
}

export function getEffectivePrepSeconds(): number {
  return isE2eTestMode ? E2E_PREP_SECONDS : ROOM_PREP_SECONDS
}

export function getFocusMinutesForSessionRecord(focusCycle: FocusCycle): number {
  if (isE2eTestMode) return E2E_RECORD_FOCUS_MINUTES
  return Math.round(getCycleDurations(focusCycle).focusSec / 60)
}
