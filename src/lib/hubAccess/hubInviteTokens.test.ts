import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearHubAccessForTests } from '@/lib/hubAccess/storage'
import {
  clearHubInviteTokensForTests,
  getOrCreateHubInviteTokenLocal,
} from '@/lib/hubAccess/inviteTokenStorage'
import {
  getOrCreateHubInviteToken,
  redeemHubInviteToken,
  resolveHubInviteTarget,
} from '@/lib/hubAccess/hubInviteTokens'
import { clearJoinedHubsForTests } from '@/lib/joinedHubs/storage'

const mocks = vi.hoisted(() => ({
  state: {
    demoMode: true,
    supabaseConfigured: false,
  },
  rpc: vi.fn(),
}))

vi.mock('@/lib/hubRooms/demo', () => ({
  get isDemoMode() {
    return mocks.state.demoMode
  },
}))

vi.mock('@/lib/supabase', () => ({
  get isSupabaseConfigured() {
    return mocks.state.supabaseConfigured
  },
  getSupabase: () =>
    mocks.state.supabaseConfigured
      ? {
          rpc: mocks.rpc,
        }
      : null,
}))

describe('hubInviteTokens demo', () => {
  beforeEach(() => {
    mocks.state.demoMode = true
    mocks.state.supabaseConfigured = false
    mocks.rpc.mockReset()
    clearHubAccessForTests()
    clearHubInviteTokensForTests()
    clearJoinedHubsForTests()
  })

  it('redeems valid token and grants access', async () => {
    const token = getOrCreateHubInviteTokenLocal('hub-1', 'creator-1')
    const result = await redeemHubInviteToken('hub-1', 'hub-slug', token, 'guest-1')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe(true)
  })

  it('rejects invalid token', async () => {
    getOrCreateHubInviteTokenLocal('hub-1', 'creator-1')
    const result = await redeemHubInviteToken('hub-1', 'hub-slug', 'wrong', 'guest-1')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe(false)
  })
})

describe('hubInviteTokens supabase', () => {
  beforeEach(() => {
    mocks.state.demoMode = false
    mocks.state.supabaseConfigured = true
    mocks.rpc.mockReset()
    clearHubAccessForTests()
    clearHubInviteTokensForTests()
    clearJoinedHubsForTests()
  })

  it('gets the hub token via rpc', async () => {
    mocks.rpc.mockResolvedValue({ data: 'hub-token', error: null })

    const result = await getOrCreateHubInviteToken('hub-1')

    expect(mocks.rpc).toHaveBeenCalledWith('get_or_create_hub_invite_token', {
      p_hub_id: 'hub-1',
    })
    expect(result).toEqual({ ok: true, data: 'hub-token' })
  })

  it('returns a friendly error when rpc fails', async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' },
    })

    const result = await getOrCreateHubInviteToken('hub-1')

    expect(result).toEqual({
      ok: false,
      message: 'Não foi possível gerar o link de convite.',
    })
  })

  it('resolves a valid invite target via rpc', async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        id: 'hub-1',
        slug: 'privado-pf',
        name: 'Mentoria PF',
        is_private: true,
        creator_id: 'creator-1',
        icon_emoji: null,
      },
      error: null,
    })

    const result = await resolveHubInviteTarget('privado-pf', 'hub-token')

    expect(mocks.rpc).toHaveBeenCalledWith('resolve_hub_invite_target', {
      p_slug: 'privado-pf',
      p_token: 'hub-token',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data?.id).toBe('hub-1')
      expect(result.data?.slug).toBe('privado-pf')
      expect(result.data?.isPrivate).toBe(true)
    }
  })
})
