import { describe, expect, it } from 'vitest'
import { parseMediaUrl } from './parseMediaUrl'

describe('parseMediaUrl', () => {
  it('parses youtube watch URLs', () => {
    const result = parseMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(result).not.toBeNull()
    expect(result?.kind).toBe('youtube')
    expect(result?.embedSrc).toContain('dQw4w9WgXcQ')
    expect(result?.label).toBe('YouTube')
  })

  it('parses youtu.be short URLs', () => {
    const result = parseMediaUrl('https://youtu.be/abc123XYZ')
    expect(result?.kind).toBe('youtube')
    expect(result?.embedSrc).toContain('abc123XYZ')
  })

  it('parses spotify track URLs', () => {
    const result = parseMediaUrl(
      'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6',
    )
    expect(result?.kind).toBe('spotify')
    expect(result?.embedSrc).toContain('open.spotify.com/embed/track/')
    expect(result?.label).toBe('Spotify')
  })

  it('parses spotify playlist URLs', () => {
    const result = parseMediaUrl(
      'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    )
    expect(result?.kind).toBe('spotify')
    expect(result?.embedSrc).toContain('/embed/playlist/')
  })

  it('returns null for unsupported URLs', () => {
    expect(parseMediaUrl('https://example.com/audio.mp3')).toBeNull()
    expect(parseMediaUrl('')).toBeNull()
  })
})
