import { describe, expect, it } from 'vitest'
import { resolvePostAuthRedirect } from './resolvePostAuthRedirect'

describe('resolvePostAuthRedirect', () => {
  it('returns default when from is missing', () => {
    expect(resolvePostAuthRedirect()).toBe('/painel')
    expect(resolvePostAuthRedirect(null)).toBe('/painel')
  })

  it('preserves path and query string', () => {
    expect(resolvePostAuthRedirect('/salas/room-1?invite=tok')).toBe(
      '/salas/room-1?invite=tok',
    )
  })

  it('rejects external and auth paths', () => {
    expect(resolvePostAuthRedirect('//evil.com')).toBe('/painel')
    expect(resolvePostAuthRedirect('/entrar')).toBe('/painel')
  })
})
