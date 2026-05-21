import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearHubAccessForTests,
  grantHubAccessLocal,
  listGrantsForHub,
} from './storage'
import { grantHubAccess as grantClient, listHubAccess } from './client'
import { grantHubAccessSupabase } from './supabaseHubAccess'

const singleMock = vi.fn()
const selectMock = vi.fn()
const insertMock = vi.fn()
const eqMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    from: fromMock,
  }),
}))

vi.mock('@/lib/hubs/demo', () => ({
  isDemoMode: false,
}))

describe('hubAccess storage (demo)', () => {
  beforeEach(() => {
    clearHubAccessForTests()
  })

  it('dedupes grants', () => {
    const first = grantHubAccessLocal('hub-1', 'user-vitor')
    const second = grantHubAccessLocal('hub-1', 'user-vitor')
    expect(first.userId).toBe(second.userId)
    expect(listGrantsForHub('hub-1')).toHaveLength(1)
  })
})

describe('hubAccess client (supabase)', () => {
  beforeEach(() => {
    fromMock.mockReset()
    insertMock.mockReset()
    selectMock.mockReset()
    eqMock.mockReset()
    singleMock.mockReset()
  })

  it('grants access via supabase', async () => {
    fromMock.mockReturnValue({ insert: insertMock })
    insertMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })
    singleMock.mockResolvedValue({
      data: {
        hub_id: 'hub-1',
        user_id: 'user-vitor',
        created_at: '2026-05-16T12:00:00.000Z',
        profiles: { username: 'vitor', avatar_url: null },
      },
      error: null,
    })

    const result = await grantClient('hub-1', 'user-vitor')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.userId).toBe('user-vitor')
      expect(result.data.username).toBe('vitor')
    }
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
    fromMock.mockReset()
    insertMock.mockReset()
    selectMock.mockReset()
    singleMock.mockReset()
  })

  it('treats unique violation as already granted', async () => {
    fromMock.mockReturnValue({ insert: insertMock })
    insertMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })
    singleMock.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    })

    const result = await grantHubAccessSupabase('hub-1', 'user-vitor')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.alreadyGranted).toBe(true)
      expect(result.data.userId).toBe('user-vitor')
    }
  })

  it('returns forbidden for RLS denial', async () => {
    fromMock.mockReturnValue({ insert: insertMock })
    insertMock.mockReturnValue({ select: selectMock })
    selectMock.mockReturnValue({ single: singleMock })
    singleMock.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'permission denied for table hub_access' },
    })

    const result = await grantHubAccessSupabase('hub-1', 'user-vitor')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('forbidden')
      expect(result.message).toContain('criador')
    }
  })
})
