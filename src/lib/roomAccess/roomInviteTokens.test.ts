import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRoomAccessForTests } from './storage'
import {
  clearRoomInviteTokensForTests,
  getOrCreateRoomInviteTokenLocal,
} from './inviteTokenStorage'
import { redeemRoomInviteToken } from './roomInviteTokens'

vi.mock('@/lib/hubRooms/demo', () => ({ isDemoMode: true }))
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  getSupabase: () => null,
}))

describe('roomInviteTokens demo', () => {
  beforeEach(() => {
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
