import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrivateHub } from './createPrivateHub'
import { getHubBySlug } from './getHubBySlug'
import { joinUserHub } from './joinUserHub'
import { leaveUserHub } from './leaveUserHub'
import { listHubs } from './listHubs'
import { listUserHubs } from './listUserHubs'
import { mapHubRow } from './mapHubRow'

const maybeSingleMock = vi.fn()
const singleMock = vi.fn()
const selectMock = vi.fn()
const insertMock = vi.fn()
const deleteMock = vi.fn()
const eqMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    from: fromMock,
  }),
}))

vi.mock('./demo', () => ({
  isDemoMode: false,
  getDemoHubs: vi.fn(),
  getDemoHubBySlug: vi.fn(),
  getDemoJoinedHubs: vi.fn(),
}))

describe('mapHubRow', () => {
  it('maps public hub with palette', () => {
    const view = mapHubRow({
      id: 'h1',
      name: 'Polícia Federal',
      slug: 'pf',
      is_private: false,
      creator_id: null,
    })
    expect(view.id).toBe('h1')
    expect(view.slug).toBe('pf')
    expect(view.isPrivate).toBeUndefined()
    expect(view.accentStripe).toContain('bg-')
  })

  it('maps private hub styling', () => {
    const view = mapHubRow({
      id: 'h2',
      name: 'Mentoria PF',
      slug: 'mentoria-pf',
      is_private: true,
      creator_id: 'u1',
    })
    expect(view.isPrivate).toBe(true)
    expect(view.shortLabel).toBe('Privado')
  })
})

describe('listHubs', () => {
  beforeEach(() => {
    selectMock.mockReset()
    fromMock.mockReset()
    fromMock.mockReturnValue({ select: selectMock })
  })

  it('returns hubs on success', async () => {
    selectMock.mockResolvedValue({
      data: [
        {
          id: 'h1',
          name: 'Banco do Brasil',
          slug: 'bb',
          is_private: false,
          creator_id: null,
        },
      ],
      error: null,
    })
    const result = await listHubs()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].slug).toBe('bb')
    }
  })

  it('maps query errors', async () => {
    selectMock.mockResolvedValue({
      data: null,
      error: { message: 'JWT expired' },
    })
    const result = await listHubs()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toBe('Entre na sua conta para continuar.')
    }
  })
})

describe('getHubBySlug', () => {
  beforeEach(() => {
    maybeSingleMock.mockReset()
    eqMock.mockReset()
    selectMock.mockReset()
    fromMock.mockReset()
    eqMock.mockReturnValue({ maybeSingle: maybeSingleMock })
    selectMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ select: selectMock })
  })

  it('returns hub when found', async () => {
    maybeSingleMock.mockResolvedValue({
      data: {
        id: 'h1',
        name: 'INSS',
        slug: 'inss',
        is_private: false,
        creator_id: null,
      },
      error: null,
    })
    const result = await getHubBySlug('inss')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data?.slug).toBe('inss')
    }
    expect(eqMock).toHaveBeenCalledWith('slug', 'inss')
  })
})

describe('listUserHubs', () => {
  beforeEach(() => {
    eqMock.mockReset()
    selectMock.mockReset()
    fromMock.mockReset()
    eqMock.mockResolvedValue({
      data: [
        {
          user_id: 'u1',
          hub_id: 'h1',
          hubs: {
            id: 'h1',
            name: 'PF',
            slug: 'pf',
            is_private: false,
            creator_id: null,
          },
        },
      ],
      error: null,
    })
    selectMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ select: selectMock })
  })

  it('parses nested hubs', async () => {
    const result = await listUserHubs('u1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].slug).toBe('pf')
    }
    expect(eqMock).toHaveBeenCalledWith('user_id', 'u1')
  })
})

describe('createPrivateHub', () => {
  beforeEach(() => {
    singleMock.mockReset()
    selectMock.mockReset()
    insertMock.mockReset()
    fromMock.mockReset()
    selectMock.mockReturnValue({ single: singleMock })
    insertMock.mockReturnValue({ select: selectMock })
    fromMock.mockReturnValue({ insert: insertMock })
  })

  it('creates private hub on success', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'h-new',
        name: 'Mentoria PF',
        slug: 'mentoria-pf',
        is_private: true,
        creator_id: 'u1',
      },
      error: null,
    })
    const result = await createPrivateHub({
      name: 'Mentoria PF',
      creatorId: 'u1',
      existingSlugs: [],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.slug).toBe('mentoria-pf')
      expect(result.data.isPrivate).toBe(true)
    }
    expect(insertMock).toHaveBeenCalledWith({
      name: 'Mentoria PF',
      slug: 'mentoria-pf',
      is_private: true,
      creator_id: 'u1',
    })
  })

  it('maps RLS forbidden to forbidden code', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: 'new row violates row-level security policy', code: '42501' },
    })
    const result = await createPrivateHub({
      name: 'Hub',
      creatorId: 'u1',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('forbidden')
    }
  })
})

describe('joinUserHub', () => {
  beforeEach(() => {
    insertMock.mockReset()
    fromMock.mockReset()
    insertMock.mockResolvedValue({ error: null })
    fromMock.mockReturnValue({ insert: insertMock })
  })

  it('inserts user hub membership', async () => {
    const result = await joinUserHub('u1', 'h1')
    expect(result.ok).toBe(true)
    expect(insertMock).toHaveBeenCalledWith({ user_id: 'u1', hub_id: 'h1' })
  })

  it('treats duplicate as success', async () => {
    insertMock.mockResolvedValue({
      error: { message: 'duplicate key value violates unique constraint', code: '23505' },
    })
    const result = await joinUserHub('u1', 'h1')
    expect(result.ok).toBe(true)
  })
})

describe('leaveUserHub', () => {
  beforeEach(() => {
    eqMock.mockReset()
    deleteMock.mockReset()
    fromMock.mockReset()
    eqMock.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    deleteMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ delete: deleteMock })
  })

  it('deletes user hub membership', async () => {
    const innerEq = vi.fn().mockResolvedValue({ error: null })
    eqMock.mockReturnValue({ eq: innerEq })
    const result = await leaveUserHub('u1', 'h1')
    expect(result.ok).toBe(true)
    expect(deleteMock).toHaveBeenCalled()
    expect(eqMock).toHaveBeenCalledWith('user_id', 'u1')
    expect(innerEq).toHaveBeenCalledWith('hub_id', 'h1')
  })
})
