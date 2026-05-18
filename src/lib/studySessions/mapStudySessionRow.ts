import type { StudySessionRow, StudySessionView } from './types'

function extractHubId(row: StudySessionRow): string | null {
  const nested = row.rooms
  if (!nested) return null
  if (Array.isArray(nested)) return nested[0]?.hub_id ?? null
  return nested.hub_id ?? null
}

export function mapStudySessionRow(row: StudySessionRow): StudySessionView {
  return {
    id: row.id,
    roomId: row.room_id,
    hubId: extractHubId(row),
    durationMinutes: row.duration_minutes,
    startedAt: new Date(row.created_at),
  }
}
