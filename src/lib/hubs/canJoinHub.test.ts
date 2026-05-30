import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHubBySlug } from './getHubBySlug'
import { canJoinHub } from './canJoinHub'

vi.mock('./getHubBySlug', () => ({
  getHubBySlug: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  getSupabase: () => null,
}))

const getHubBySlugMock = vi.mocked(getHubBySlug)

describe('canJoinHub', () => {
  beforeEach(() => {
    getHubBySlugMock.mockReset()
  })

  it('allows public hub for any user', async () => {
    getHubBySlugMock.mockResolvedValue({
      ok: true,
      data: {
        id: 'h1',
        slug: 'pf',
        name: 'PF',
        shortLabel: 'PF',
        accentStripe: '',
        accentBadge: '',
      },
    })

    const result = await canJoinHub('pf', 'user-2')
    expect(result.status).toBe('allowed')
  })

  it('allows private hub for creator', async () => {
    getHubBySlugMock.mockResolvedValue({
      ok: true,
      data: {
        id: 'h1',
        slug: 'priv',
        name: 'Privado',
        shortLabel: 'Privado',
        accentStripe: '',
        accentBadge: '',
        isPrivate: true,
        creatorId: 'creator-1',
      },
    })

    const result = await canJoinHub('priv', 'creator-1')
    expect(result.status).toBe('allowed')
  })

  it('denies private hub for non-member without grant', async () => {
    getHubBySlugMock.mockResolvedValue({
      ok: true,
      data: {
        id: 'h1',
        slug: 'priv',
        name: 'Privado',
        shortLabel: 'Privado',
        accentStripe: '',
        accentBadge: '',
        isPrivate: true,
        creatorId: 'creator-1',
      },
    })

    const result = await canJoinHub('priv', 'user-2')
    expect(result.status).toBe('denied_private')
  })
})
