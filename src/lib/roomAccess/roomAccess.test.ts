import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_INVITE_COOLDOWN_MS } from '@/lib/accessInvites/constants'
import {
  acceptRoomAccessGrant,
  clearRoomAccessForTests,
  grantRoomAccess as grantLocal,
  hasRoomAccess as hasLocal,
  listGrantsForRoom,
} from './storage'
import {
  acceptRoomAccess as acceptClient,
  grantRoomAccess as grantClient,
  listRoomAccess,
} from './client'
import {
  acceptRoomAccessSupabase,
  grantRoomAccessSupabase,
} from './supabaseRoomAccess'

const selectMock = vi.fn()
const eqMock = vi.fn()
const fromMock = vi.fn()
const rpcMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    from: fromMock,
    rpc: rpcMock,
  }),
}))

vi.mock('@/lib/hubRooms/demo', () => ({
  isDemoMode: false,
}))

describe('roomAccess storage (demo)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-27T12:00:00.000Z'))
    clearRoomAccessForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('dedupes grants within cooldown', () => {
    const first = grantLocal('room-1', 'user-vitor')
    const second = grantLocal('room-1', 'user-vitor')
    expect(first.grantedAt).toBe(second.grantedAt)
    expect(listGrantsForRoom('room-1')).toHaveLength(1)
    expect(hasLocal('room-1', 'user-vitor')).toBe(true)
    expect(hasLocal('room-1', 'user-carla')).toBe(false)
  })

  it('re-grants after cooldown with fresh timestamp', () => {
    grantLocal('room-1', 'user-vitor')
    vi.advanceTimersByTime(ACCESS_INVITE_COOLDOWN_MS + 1)
    expect(hasLocal('room-1', 'user-vitor')).toBe(false)

    const second = grantLocal('room-1', 'user-vitor')
    expect(hasLocal('room-1', 'user-vitor')).toBe(true)
    expect(listGrantsForRoom('room-1')).toHaveLength(1)
    expect(new Date(second.grantedAt).getTime()).toBe(Date.now())
  })

  it('keeps access after accept beyond cooldown', () => {
    grantLocal('room-1', 'user-vitor')
    acceptRoomAccessGrant('room-1', 'user-vitor')
    vi.advanceTimersByTime(ACCESS_INVITE_COOLDOWN_MS + 1)
    expect(hasLocal('room-1', 'user-vitor')).toBe(true)
  })
})

describe('roomAccess client (supabase)', () => {
  beforeEach(() => {
    fromMock.mockReset()
    rpcMock.mockReset()
    selectMock.mockReset()
    eqMock.mockReset()
  })

  it('grants access via supabase rpc', async () => {
    rpcMock.mockResolvedValue({
      data: {
        room_id: 'room-1',
        user_id: 'user-vitor',
        created_at: '2026-05-16T12:00:00.000Z',
        accepted_at: null,
        already_granted: false,
      },
      error: null,
    })

    const result = await grantClient('room-1', 'user-vitor')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.userId).toBe('user-vitor')
    }
    expect(rpcMock).toHaveBeenCalledWith('grant_room_access', {
      p_room_id: 'room-1',
      p_user_id: 'user-vitor',
    })
  })

  it('accepts access via supabase rpc', async () => {
    rpcMock.mockResolvedValue({
      data: {
        ok: true,
        room_id: 'room-1',
        user_id: 'user-vitor',
        created_at: '2026-05-16T12:00:00.000Z',
        accepted_at: '2026-05-16T13:00:00.000Z',
      },
      error: null,
    })

    const result = await acceptClient('room-1', 'user-vitor')
    expect(result.ok).toBe(true)
    expect(rpcMock).toHaveBeenCalledWith('accept_room_access', {
      p_room_id: 'room-1',
    })
  })

  it('lists access rows', async () => {
    fromMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ eq: eqMock })
    eqMock.mockResolvedValue({
      data: [
        {
          room_id: 'room-a',
          user_id: 'user-vitor',
          created_at: '2026-05-16T12:00:00.000Z',
          accepted_at: null,
          profiles: { username: 'vitor', avatar_url: null },
        },
      ],
      error: null,
    })

    const result = await listRoomAccess('room-a')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
    }
  })
})

describe('grantRoomAccessSupabase', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('surfaces already granted from rpc payload', async () => {
    rpcMock.mockResolvedValue({
      data: {
        room_id: 'room-1',
        user_id: 'user-vitor',
        created_at: '2026-05-16T12:00:00.000Z',
        accepted_at: null,
        already_granted: true,
      },
      error: null,
    })

    const result = await grantRoomAccessSupabase('room-1', 'user-vitor')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.alreadyGranted).toBe(true)
      expect(result.data.userId).toBe('user-vitor')
    }
  })
})

describe('acceptRoomAccessSupabase', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('returns error when accept fails', async () => {
    rpcMock.mockResolvedValue({
      data: { ok: false },
      error: null,
    })

    const result = await acceptRoomAccessSupabase('room-1')
    expect(result.ok).toBe(false)
  })
})
