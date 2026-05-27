import { AuthError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OAUTH_PENDING_STORAGE_KEY } from './oauthCallback'
import { signInWithGoogle } from './signInWithGoogle'

const signInWithOAuthMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: { signInWithOAuth: signInWithOAuthMock },
  }),
}))

describe('signInWithGoogle', () => {
  beforeEach(() => {
    signInWithOAuthMock.mockReset()
    sessionStorage.clear()
    vi.stubGlobal('location', { origin: 'http://localhost:5173' })
  })

  it('calls signInWithOAuth with google and redirectTo /auth/callback', async () => {
    signInWithOAuthMock.mockResolvedValue({ error: null })
    const result = await signInWithGoogle()
    expect(result).toEqual({ ok: true })
    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/auth/callback' },
    })
    expect(sessionStorage.getItem(OAUTH_PENDING_STORAGE_KEY)).toBe('1')
  })

  it('maps errors', async () => {
    signInWithOAuthMock.mockResolvedValue({
      error: new AuthError('OAuth failed', 400, 'unexpected_failure'),
    })
    const result = await signInWithGoogle()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toBeTruthy()
    }
  })
})
