import { describe, expect, it } from 'vitest'
import { buildHubInviteUrl } from './hubInviteUrl'

describe('buildHubInviteUrl', () => {
  it('builds hub path under origin', () => {
    expect(buildHubInviteUrl('pf-2026', 'https://synoire.app')).toBe(
      'https://synoire.app/hubs/pf-2026',
    )
  })

  it('appends invite token query param when provided', () => {
    expect(buildHubInviteUrl('mentoria-pf', 'https://synoire.app', 'abc99')).toBe(
      'https://synoire.app/hubs/mentoria-pf?invite=abc99',
    )
  })
})
