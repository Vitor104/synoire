import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_INVITE_COOLDOWN_MS } from '@/lib/accessInvites/constants'
import {
  clearHubAccessForTests,
  grantHubAccessLocal,
  listGrantsForHub,
} from './storage'
import { grantHubAccess as grantClient, listHubAccess } from './client'
import { grantHubAccessSupabase } from './supabaseHubAccess'

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

describe('hubAccess storage (local)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-27T12:00:00.000Z'))
    clearHubAccessForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('dedupes grants within cooldown', () => {
    const first = grantHubAccessLocal('hub-1', 'user-vitor')
    const second = grantHubAccessLocal('hub-1', 'user-vitor')
    expect(first.grantedAt).toBe(second.grantedAt)
    expect(listGrantsForHub('hub-1')).toHaveLength(1)
  })

  it('re-grants after cooldown with fresh timestamp', () => {
    grantHubAccessLocal('hub-1', 'user-vitor')
    vi.advanceTimersByTime(ACCESS_INVITE_COOLDOWN_MS + 1)
    const second = grantHubAccessLocal('hub-1', 'user-vitor')
    expect(listGrantsForHub('hub-1')).toHaveLength(1)
    expect(new Date(second.grantedAt).getTime()).toBe(Date.now())
  })
})

describe('hubAccess client (supabase)', () => {
  beforeEach(() => {
    fromMock.mockReset()
    selectMock.mockReset()
    eqMock.mockReset()
    rpcMock.mockReset()
  })

  it('grants access via supabase', async () => {
    rpcMock.mockResolvedValue({
      data: {
        hub_id: 'hub-1',
        user_id: 'user-vitor',
        created_at: '2026-05-16T12:00:00.000Z',
        already_granted: false,
      },
      error: null,
    })

    const result = await grantClient('hub-1', 'user-vitor')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.userId).toBe('user-vitor')
      expect(result.data.grantedAt).toBe('2026-05-16T12:00:00.000Z')
    }
    expect(rpcMock).toHaveBeenCalledWith('grant_hub_access', {
      p_hub_id: 'hub-1',
      p_user_id: 'user-vitor',
    })
  })

  it('lists access rows', async () => {
    fromMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ eq: eqMock })
    eqMock.mockResolvedValue({
      data: [
        {
          hub_id: 'hub-a',
          user_id: 'user-vitor',
          created_at: '2026-05-16T12:00:00.000Z',
          profiles: { username: 'vitor', avatar_url: null },
        },
      ],
      error: null,
    })

    const result = await listHubAccess('hub-a')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
    }
  })
})

describe('grantHubAccessSupabase duplicate', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('surfaces already granted from rpc payload', async () => {
    rpcMock.mockResolvedValue({
      data: {
        hub_id: 'hub-1',
        user_id: 'user-vitor',
        created_at: '2026-05-16T12:00:00.000Z',
        already_granted: true,
      },
      error: null,
    })

    const result = await grantHubAccessSupabase('hub-1', 'user-vitor')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.alreadyGranted).toBe(true)
      expect(result.data.userId).toBe('user-vitor')
    }
  })

  it('returns forbidden for RLS denial', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'permission denied for function grant_hub_access' },
    })

    const result = await grantHubAccessSupabase('hub-1', 'user-vitor')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('forbidden')
      expect(result.message).toContain('criador')
    }
  })
})
