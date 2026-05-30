import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRoomAccessForTests } from './storage'
import {
  clearRoomInviteTokensForTests,
  getOrCreateRoomInviteTokenLocal,
} from './inviteTokenStorage'
import { getOrCreateRoomInviteToken, redeemRoomInviteToken } from './roomInviteTokens'

const mocks = vi.hoisted(() => ({
  state: {
    supabaseConfigured: false,
  },
  rpc: vi.fn(),
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

describe('roomInviteTokens local storage', () => {
  beforeEach(() => {
    mocks.state.supabaseConfigured = false
    mocks.rpc.mockReset()
    clearRoomAccessForTests()
    clearRoomInviteTokensForTests()
  })

  it('redeems valid token and grants access', async () => {
    const token = getOrCreateRoomInviteTokenLocal('room-1', 'creator-1')
    const result = await redeemRoomInviteToken('room-1', token, 'guest-1')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe(true)
  })

  it('rejects invalid token', async () => {
    getOrCreateRoomInviteTokenLocal('room-1', 'creator-1')
    const result = await redeemRoomInviteToken('room-1', 'bad-token', 'guest-1')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe(false)
  })
})

describe('roomInviteTokens supabase', () => {
  beforeEach(() => {
    mocks.state.supabaseConfigured = true
    mocks.rpc.mockReset()
    clearRoomAccessForTests()
    clearRoomInviteTokensForTests()
  })

  it('gets the room token via rpc', async () => {
    mocks.rpc.mockResolvedValue({ data: 'room-token', error: null })

    const result = await getOrCreateRoomInviteToken('room-1')

    expect(mocks.rpc).toHaveBeenCalledWith('get_or_create_room_invite_token', {
      p_room_id: 'room-1',
    })
    expect(result).toEqual({ ok: true, data: 'room-token' })
  })

  it('returns a friendly error when rpc fails', async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' },
    })

    const result = await getOrCreateRoomInviteToken('room-1')

    expect(result).toEqual({
      ok: false,
      message: 'Não foi possível gerar o link de convite.',
    })
  })
})
