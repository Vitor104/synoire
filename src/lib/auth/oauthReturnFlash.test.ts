import { beforeEach, describe, expect, it } from 'vitest'
import { consumeOAuthReturnFlash, writeOAuthReturnFlash } from './oauthReturnFlash'

describe('oauthReturnFlash', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('writes and consumes a message once', () => {
    writeOAuthReturnFlash('Falha no login')
    expect(consumeOAuthReturnFlash()).toBe('Falha no login')
    expect(consumeOAuthReturnFlash()).toBeNull()
  })
})
