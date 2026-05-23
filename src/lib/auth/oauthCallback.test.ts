import { describe, expect, it } from 'vitest'
import {
  getOAuthCallbackError,
  hasOAuthCodeInUrl,
  isAuthSessionReady,
  isOAuthCallbackUrl,
  shouldIgnoreAuthSessionDuringOAuth,
  shouldSkipIdleCheckForOAuth,
} from './oauthCallback'

function mockLocation(parts: { search?: string; hash?: string } = {}): Location {
  return {
    search: parts.search ?? '',
    hash: parts.hash ?? '',
  } as Location
}

describe('isOAuthCallbackUrl', () => {
  it('detects PKCE code in search', () => {
    expect(isOAuthCallbackUrl(mockLocation({ search: '?code=abc' }))).toBe(true)
  })

  it('detects error in search', () => {
    expect(
      isOAuthCallbackUrl(mockLocation({ search: '?error=access_denied' })),
    ).toBe(true)
  })

  it('detects access_token in hash', () => {
    expect(
      isOAuthCallbackUrl(mockLocation({ hash: '#access_token=xyz' })),
    ).toBe(true)
  })

  it('returns false for normal URLs', () => {
    expect(isOAuthCallbackUrl(mockLocation({ search: '', hash: '' }))).toBe(false)
  })
})

describe('hasOAuthCodeInUrl', () => {
  it('detects PKCE code in search', () => {
    expect(hasOAuthCodeInUrl(mockLocation({ search: '?code=abc' }))).toBe(true)
  })

  it('returns false without code', () => {
    expect(hasOAuthCodeInUrl(mockLocation({ search: '?error=denied' }))).toBe(
      false,
    )
  })
})

describe('shouldIgnoreAuthSessionDuringOAuth', () => {
  const session = { access_token: 't' } as never

  it('ignores INITIAL_SESSION while code is in URL', () => {
    expect(
      shouldIgnoreAuthSessionDuringOAuth(
        'INITIAL_SESSION',
        session,
        mockLocation({ search: '?code=abc' }),
      ),
    ).toBe(true)
  })

  it('accepts SIGNED_IN while code is in URL', () => {
    expect(
      shouldIgnoreAuthSessionDuringOAuth(
        'SIGNED_IN',
        session,
        mockLocation({ search: '?code=abc' }),
      ),
    ).toBe(false)
  })

  it('does not ignore after code is gone', () => {
    expect(
      shouldIgnoreAuthSessionDuringOAuth(
        'INITIAL_SESSION',
        session,
        mockLocation({ search: '' }),
      ),
    ).toBe(false)
  })
})

describe('shouldSkipIdleCheckForOAuth', () => {
  it('is true during PKCE callback URL', () => {
    expect(
      shouldSkipIdleCheckForOAuth(mockLocation({ search: '?code=abc' })),
    ).toBe(true)
  })

  it('is false on normal URLs', () => {
    expect(shouldSkipIdleCheckForOAuth(mockLocation())).toBe(false)
  })
})

describe('getOAuthCallbackError', () => {
  it('returns error_description when present', () => {
    expect(
      getOAuthCallbackError(
        mockLocation({ search: '?error=access_denied&error_description=Denied' }),
      ),
    ).toBe('Denied')
  })

  it('returns null when no error', () => {
    expect(getOAuthCallbackError(mockLocation())).toBeNull()
  })
})

describe('isAuthSessionReady', () => {
  it('is false while loading', () => {
    expect(
      isAuthSessionReady({ access_token: 't' } as never, true),
    ).toBe(false)
  })

  it('is false while OAuth exchange is in progress', () => {
    expect(
      isAuthSessionReady({ access_token: 't' } as never, false, true),
    ).toBe(false)
  })

  it('is false without access_token', () => {
    expect(isAuthSessionReady({ user: {} } as never, false)).toBe(false)
    expect(isAuthSessionReady(null, false)).toBe(false)
  })

  it('is true with token and not loading', () => {
    expect(
      isAuthSessionReady({ access_token: 't' } as never, false),
    ).toBe(true)
  })
})
