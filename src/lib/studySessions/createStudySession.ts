import { recordDemoStudyTime } from '@/lib/userStats/demoStats'
import {
  fetchStudySessionById,
  recordPartialStudyTime,
} from '@/lib/userStats/recordPartialStudyTime'
import { isDemoMode } from './demo'
import { mapStudySessionsCreateError } from './errors'
import type { CreateStudySessionInput, StudySessionView, StudySessionsResult } from './types'

export async function createStudySession(
  userId: string,
  input: CreateStudySessionInput,
): Promise<StudySessionsResult<StudySessionView>> {
  if (isDemoMode) {
    const { session } = recordDemoStudyTime(userId, input)
    return { ok: true, data: session }
  }

  const recorded = await recordPartialStudyTime(
    userId,
    input.roomId,
    input.durationMinutes,
  )
  if (!recorded.ok) {
    return { ok: false, message: recorded.message }
  }

  const loaded = await fetchStudySessionById(recorded.data.sessionId)
  if (!loaded.ok) {
    if (import.meta.env.DEV) {
      console.error('[studySessions createStudySession] fetch after rpc', loaded.message)
    }
    return { ok: false, message: mapStudySessionsCreateError(loaded.message) }
  }

  return { ok: true, data: loaded.data }
}
