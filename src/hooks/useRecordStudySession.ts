import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFocusMinutesForSessionRecord } from '@/lib/e2eTestMode'
import type { StudyRoom } from '@/lib/hubRooms'
import type { RoomPhase } from '@/lib/roomTimer'

type SessionMode = 'onboarding' | 'lounge' | 'active'

function sessionDedupKey(roomId: string, startedAt: string): string {
  return `synoire-study-session:${roomId}:${startedAt}`
}

function tryClaimSessionRecord(roomId: string, startedAt: string): boolean {
  try {
    const key = sessionDedupKey(roomId, startedAt)
    if (sessionStorage.getItem(key)) return false
    sessionStorage.setItem(key, '1')
    return true
  } catch {
    return true
  }
}

type RecordSessionFn = (
  roomId: string,
  durationMinutes: number,
) => Promise<{ ok: true } | { ok: false; message: string }>

type UseRecordStudySessionArgs = {
  roomId: string | undefined
  studyRoom: StudyRoom | null | undefined
  sessionMode: SessionMode
  phase: RoomPhase
  isIdle: boolean
  isSegmentComplete: boolean
  startedAt: string | Date
  recordSession: RecordSessionFn
}

function startedAtKey(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString()
}

export function useRecordStudySession({
  roomId,
  studyRoom,
  sessionMode,
  phase,
  isIdle,
  isSegmentComplete,
  startedAt,
  recordSession,
}: UseRecordStudySessionArgs) {
  const { user } = useAuth()
  const recordingRef = useRef(false)
  const prevPhaseRef = useRef(phase)
  const lastFocusStartedAtRef = useRef<string | null>(null)

  useEffect(() => {
    if (phase === 'focus' && !isIdle) {
      lastFocusStartedAtRef.current = startedAtKey(startedAt)
    }

    const prevPhase = prevPhaseRef.current
    prevPhaseRef.current = phase

    const focusSegmentCompleted =
      (phase === 'focus' && isSegmentComplete) ||
      (prevPhase === 'focus' &&
        (phase === 'break' || phase === 'long_break'))

    if (!roomId || !studyRoom || !user?.id) return
    if (sessionMode !== 'active') return
    if (isIdle || !focusSegmentCompleted) return

    const focusStartedAt = lastFocusStartedAtRef.current ?? startedAtKey(startedAt)
    if (!focusStartedAt) return

    if (phase !== 'focus') {
      lastFocusStartedAtRef.current = null
    }

    if (!tryClaimSessionRecord(roomId, focusStartedAt)) return
    if (recordingRef.current) return

    const durationMinutes = getFocusMinutesForSessionRecord(studyRoom.focus_cycle)

    recordingRef.current = true
    void recordSession(roomId, durationMinutes).then((result) => {
      recordingRef.current = false
      if (!result.ok && import.meta.env.DEV) {
        console.error('[useRecordStudySession]', result.message)
      }
    })
  }, [
    roomId,
    studyRoom,
    user?.id,
    sessionMode,
    isIdle,
    isSegmentComplete,
    phase,
    startedAt,
    recordSession,
  ])
}
