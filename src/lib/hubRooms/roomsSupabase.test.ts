import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoomApi } from './createRoom'
import { listRoomsByHub } from './listRoomsByHub'
import { patchRoomTimer } from './patchRoomTimer'

const singleMock = vi.fn()
const selectMock = vi.fn()
const insertMock = vi.fn()
const updateMock = vi.fn()
const eqMock = vi.fn()
const orderMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    from: fromMock,
  }),
}))

describe('listRoomsByHub', () => {
  beforeEach(() => {
    fromMock.mockReset()
    selectMock.mockReset()
    eqMock.mockReset()
    orderMock.mockReset()
    fromMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ eq: eqMock })
    eqMock.mockReturnValue({ order: orderMock })
  })

  it('returns mapped rooms', async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'room-1',
          hub_id: 'hub-1',
          name: 'Direito • 25/5',
          is_private: false,
          creator_id: 'u1',
          created_at: '2026-05-16T12:00:00.000Z',
          current_timer_state: {
            status: 'idle',
            started_at: '2026-05-16T12:00:00.000Z',
            focus_sec: 1500,
            break_sec: 300,
            focus_cycle: '25/5',
          },
          hubs: { slug: 'trt' },
        },
      ],
      error: null,
    })

    const result = await listRoomsByHub('hub-1', 'trt')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].hub_slug).toBe('trt')
      expect(result.data[0].name).toBe('Direito • 25/5')
    }
  })
})

describe('createRoomApi', () => {
  beforeEach(() => {
    fromMock.mockReset()
    insertMock.mockReset()
    selectMock.mockReset()
    singleMock.mockReset()
    fromMock.mockReturnValue({ insert: insertMock })
    insertMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })
  })

  it('returns forbidden for private room RLS', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: 'permission denied', code: '42501' },
    })

    const result = await createRoomApi({
      hubSlug: 'trt',
      hubId: 'hub-1',
      creatorId: 'u1',
      theme: 'Direito',
      focusCycle: '25/5',
      isPrivate: true,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('forbidden')
      expect(result.message).toContain('Glow')
    }
  })

  it('creates room on success', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'room-new',
        hub_id: 'hub-1',
        name: 'Direito • 25/5',
        is_private: false,
        creator_id: 'u1',
        created_at: '2026-05-16T12:00:00.000Z',
        current_timer_state: {
          status: 'idle',
          started_at: '2026-05-16T12:00:00.000Z',
          focus_sec: 1500,
          break_sec: 300,
          focus_cycle: '25/5',
        },
        hubs: { slug: 'trt' },
      },
      error: null,
    })

    const result = await createRoomApi({
      hubSlug: 'trt',
      hubId: 'hub-1',
      creatorId: 'u1',
      theme: 'Direito',
      focusCycle: '25/5',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe('room-new')
      expect(insertMock).toHaveBeenCalled()
    }
  })
})

describe('patchRoomTimer', () => {
  beforeEach(() => {
    fromMock.mockReset()
    updateMock.mockReset()
    selectMock.mockReset()
    eqMock.mockReset()
    singleMock.mockReset()
    fromMock.mockReturnValue({ update: updateMock })
    updateMock.mockReturnValue({ eq: eqMock })
    eqMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })
  })

  it('updates timer state', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'room-1',
        hub_id: 'hub-1',
        name: 'Direito • 25/5',
        is_private: false,
        creator_id: 'u1',
        created_at: '2026-05-16T12:00:00.000Z',
        current_timer_state: {
          status: 'focus',
          started_at: '2026-05-16T12:01:00.000Z',
          focus_sec: 1500,
          break_sec: 300,
          focus_cycle: '25/5',
        },
        hubs: { slug: 'trt' },
      },
      error: null,
    })

    const result = await patchRoomTimer(
      'room-1',
      {
        status: 'focus',
        started_at: '2026-05-16T12:01:00.000Z',
        focus_sec: 1500,
        break_sec: 300,
        focus_cycle: '25/5',
      },
      'trt',
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.current_timer_state.status).toBe('focus')
    }
  })
})
