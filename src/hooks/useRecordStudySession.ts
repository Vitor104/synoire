import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCycleDurations } from '@/lib/hubRooms'
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

  useEffect(() => {
    if (!roomId || !studyRoom || !user?.id) return
    if (sessionMode !== 'active') return
    if (isIdle || !isSegmentComplete || phase !== 'focus') return
    const focusStartedAt = startedAtKey(startedAt)
    if (!tryClaimSessionRecord(roomId, focusStartedAt)) return
    if (recordingRef.current) return

    const durationMinutes = Math.round(
      getCycleDurations(studyRoom.focus_cycle).focusSec / 60,
    )

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
