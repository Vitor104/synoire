import type { CreateStudySessionInput, StudySessionRow, StudySessionView } from './types'
import { mapStudySessionRow } from './mapStudySessionRow'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const DEMO_SESSIONS_KEY = 'synoire_demo_study_sessions'

function readDemoSessions(): StudySessionRow[] {
  try {
    const raw = localStorage.getItem(DEMO_SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StudySessionRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeDemoSessions(sessions: StudySessionRow[]): void {
  localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(sessions))
}

export function listDemoStudySessions(userId: string): StudySessionView[] {
  return readDemoSessions()
    .filter((s) => s.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map(mapStudySessionRow)
}

export function createDemoStudySession(
  userId: string,
  input: CreateStudySessionInput,
): StudySessionView {
  const now = new Date().toISOString()
  const row: StudySessionRow = {
    id: `demo-session-${crypto.randomUUID()}`,
    user_id: userId,
    room_id: input.roomId,
    duration_minutes: input.durationMinutes,
    created_at: now,
    rooms: { hub_id: input.roomId.startsWith('demo-') ? input.roomId : 'demo-hub' },
  }
  const sessions = readDemoSessions()
  sessions.push(row)
  writeDemoSessions(sessions)
  return mapStudySessionRow(row)
}
