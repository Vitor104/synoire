export type StudySessionRow = {
  id: string
  user_id: string
  room_id: string | null
  duration_minutes: number
  created_at: string
  rooms?: { hub_id: string } | { hub_id: string }[] | null
}

export type StudySessionView = {
  id: string
  roomId: string | null
  hubId: string | null
  durationMinutes: number
  startedAt: Date
}

export type CreateStudySessionInput = {
  roomId: string
  durationMinutes: number
}

export type StudySessionsResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }
