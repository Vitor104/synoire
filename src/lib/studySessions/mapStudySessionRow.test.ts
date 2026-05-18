import { describe, expect, it } from 'vitest'
import { mapStudySessionRow } from './mapStudySessionRow'
import type { StudySessionRow } from './types'

describe('mapStudySessionRow', () => {
  const base: StudySessionRow = {
    id: 's1',
    user_id: 'u1',
    room_id: 'r1',
    duration_minutes: 25,
    created_at: '2026-05-17T14:30:00.000Z',
  }

  it('maps hub_id from nested object', () => {
    const view = mapStudySessionRow({
      ...base,
      rooms: { hub_id: 'hub-1' },
    })
    expect(view.hubId).toBe('hub-1')
    expect(view.durationMinutes).toBe(25)
    expect(view.startedAt.toISOString()).toBe('2026-05-17T14:30:00.000Z')
  })

  it('maps hub_id from nested array', () => {
    const view = mapStudySessionRow({
      ...base,
      rooms: [{ hub_id: 'hub-2' }],
    })
    expect(view.hubId).toBe('hub-2')
  })

  it('returns null hub when join missing', () => {
    const view = mapStudySessionRow(base)
    expect(view.hubId).toBeNull()
  })
})
