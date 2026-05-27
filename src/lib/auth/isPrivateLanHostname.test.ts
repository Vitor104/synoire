import { describe, expect, it } from 'vitest'
import { isPrivateLanHostname } from './isPrivateLanHostname'

describe('isPrivateLanHostname', () => {
  it('detects 192.168.x.x', () => {
    expect(isPrivateLanHostname('192.168.0.12')).toBe(true)
  })

  it('detects 10.x.x.x', () => {
    expect(isPrivateLanHostname('10.0.0.5')).toBe(true)
  })

  it('rejects localhost and public hosts', () => {
    expect(isPrivateLanHostname('localhost')).toBe(false)
    expect(isPrivateLanHostname('synoire.netlify.app')).toBe(false)
  })
})
