import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearHubAccessForTests } from '@/lib/hubAccess/storage'
import {
  clearHubInviteTokensForTests,
  getOrCreateHubInviteTokenLocal,
} from '@/lib/hubAccess/inviteTokenStorage'
import { redeemHubInviteToken } from '@/lib/hubAccess/hubInviteTokens'
import { clearJoinedHubsForTests } from '@/lib/joinedHubs/storage'

vi.mock('@/lib/hubRooms/demo', () => ({ isDemoMode: true }))
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  getSupabase: () => null,
}))

describe('hubInviteTokens demo', () => {
  beforeEach(() => {
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
