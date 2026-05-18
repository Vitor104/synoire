import { AuthError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signIn } from './signIn'

const signInWithPasswordMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  }),
}))

describe('signIn', () => {
  beforeEach(() => {
    signInWithPasswordMock.mockReset()
  })

  it('returns ok on success', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null })
    const result = await signIn({ email: 'a@b.com', password: 'secret' })
    expect(result).toEqual({ ok: true })
  })

  it('maps invalid credentials', async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: new AuthError('Invalid login credentials', 400, 'invalid_credentials'),
    })
    const result = await signIn({ email: 'a@b.com', password: 'wrong' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toBe('E-mail ou senha inválidos.')
    }
  })
})
