import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getRoomByIdMock,
  grantMaybeSingleMock,
  creatorMaybeSingleMock,
  fromMock,
} = vi.hoisted(() => ({
  getRoomByIdMock: vi.fn(),
  grantMaybeSingleMock: vi.fn(),
  creatorMaybeSingleMock: vi.fn(),
  fromMock: vi.fn(),
}))

vi.mock('@/lib/hubRooms/getRoomById', () => ({
  getRoomById: getRoomByIdMock,
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    from: fromMock,
  }),
}))

import { canJoinRoom } from './canJoinRoom'

const baseRoom = {
  id: 'room-1',
  hub_slug: 'trt',
  name: 'Direito • 25/5',
  focus_cycle: '25/5' as const,
  is_private: false,
  creator_id: 'creator-1',
  current_timer_state: {
    status: 'idle' as const,
    started_at: '2026-05-16T12:00:00.000Z',
    focus_sec: 1500,
    break_sec: 300,
  },
  present_count: 0,
  empty_since: null,
  created_at: '2026-05-16T12:00:00.000Z',
}

describe('canJoinRoom', () => {
  beforeEach(() => {
    getRoomByIdMock.mockReset()
    fromMock.mockReset()
    grantMaybeSingleMock.mockReset()
    creatorMaybeSingleMock.mockReset()

    fromMock.mockImplementation((table: string) => {
      if (table === 'room_access') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: grantMaybeSingleMock,
              }),
            }),
          }),
        }
      }
      if (table === 'rooms') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: creatorMaybeSingleMock,
            }),
          }),
        }
      }
      throw new Error(`unexpected table: ${table}`)
    })
    grantMaybeSingleMock.mockResolvedValue({ data: null, error: null })
    creatorMaybeSingleMock.mockResolvedValue({ data: null, error: null })
  })

  it('allows public room without grant', async () => {
    getRoomByIdMock.mockResolvedValue({ ok: true, data: baseRoom })

    const result = await canJoinRoom('room-1', 'user-2')
    expect(result.status).toBe('allowed')
  })

  it('denies private room without grant for non-creator', async () => {
    getRoomByIdMock.mockResolvedValue({
      ok: true,
      data: { ...baseRoom, is_private: true },
    })

    const result = await canJoinRoom('room-1', 'user-2')
    expect(result.status).toBe('denied_private')
  })

  it('allows private room for creator without grant', async () => {
    getRoomByIdMock.mockResolvedValue({
      ok: true,
      data: { ...baseRoom, is_private: true, creator_id: 'creator-1' },
    })

    const result = await canJoinRoom('room-1', 'creator-1')
    expect(result.status).toBe('allowed')
  })

  it('allows private room with active grant', async () => {
    getRoomByIdMock.mockResolvedValue({
      ok: true,
      data: { ...baseRoom, is_private: true },
    })
    grantMaybeSingleMock.mockResolvedValue({
      data: {
        room_id: 'room-1',
        created_at: new Date().toISOString(),
        accepted_at: null,
      },
      error: null,
    })

    const result = await canJoinRoom('room-1', 'user-2')
    expect(result.status).toBe('allowed')
  })

  it('denies private room with expired grant', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-27T12:00:00.000Z'))
    getRoomByIdMock.mockResolvedValue({
      ok: true,
      data: { ...baseRoom, is_private: true },
    })
    grantMaybeSingleMock.mockResolvedValue({
      data: {
        room_id: 'room-1',
        created_at: '2026-05-25T12:00:00.000Z',
        accepted_at: null,
      },
      error: null,
    })

    const result = await canJoinRoom('room-1', 'user-2')
    expect(result.status).toBe('denied_private')
    vi.useRealTimers()
  })

  it('returns not_found when room missing and no grant', async () => {
    getRoomByIdMock.mockResolvedValue({ ok: true, data: null })

    const result = await canJoinRoom('room-missing', 'user-2')
    expect(result.status).toBe('not_found')
  })

  it('returns denied_private on forbidden without grant', async () => {
    getRoomByIdMock.mockResolvedValue({
      ok: false,
      message: 'permission denied',
      code: 'forbidden',
    })

    const result = await canJoinRoom('room-1', 'user-2')
    expect(result.status).toBe('denied_private')
  })

  it('allows on forbidden when grant exists', async () => {
    getRoomByIdMock.mockResolvedValue({
      ok: false,
      message: 'permission denied',
      code: 'forbidden',
    })
    grantMaybeSingleMock.mockResolvedValue({
      data: {
        room_id: 'room-1',
        created_at: new Date().toISOString(),
        accepted_at: null,
      },
      error: null,
    })

    const result = await canJoinRoom('room-1', 'user-2')
    expect(result.status).toBe('allowed')
  })

  it('allows on forbidden when user is creator', async () => {
    getRoomByIdMock.mockResolvedValue({
      ok: false,
      message: 'permission denied',
      code: 'forbidden',
    })
    creatorMaybeSingleMock.mockResolvedValue({
      data: { creator_id: 'creator-1' },
      error: null,
    })

    const result = await canJoinRoom('room-1', 'creator-1')
    expect(result.status).toBe('allowed')
  })
})
