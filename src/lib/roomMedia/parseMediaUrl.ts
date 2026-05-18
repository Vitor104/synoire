export type ExternalMediaKind = 'youtube' | 'spotify'

export type ParsedMediaUrl = {
  kind: ExternalMediaKind
  embedSrc: string
  label: string
}

function extractYouTubeId(input: string): string | null {
  try {
    const url = new URL(input.trim())
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/')[2] ?? null
      }
      const v = url.searchParams.get('v')
      if (v) return v
      const shorts = url.pathname.match(/^\/shorts\/([^/]+)/)
      if (shorts?.[1]) return shorts[1]
    }
  } catch {
    return null
  }
  return null
}

function buildYouTubeEmbed(videoId: string): ParsedMediaUrl {
  const params = new URLSearchParams({
    autoplay: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    modestbranding: '1',
  })
  return {
    kind: 'youtube',
    embedSrc: `https://www.youtube.com/embed/${videoId}?${params.toString()}`,
    label: 'YouTube',
  }
}

function extractSpotifyPath(input: string): string | null {
  try {
    const url = new URL(input.trim())
    const host = url.hostname.replace(/^www\./, '')
    if (host !== 'open.spotify.com') return null
    const match = url.pathname.match(
      /^\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/,
    )
    if (!match) return null
    return `${match[1]}/${match[2]}`
  } catch {
    return null
  }
}

function buildSpotifyEmbed(path: string): ParsedMediaUrl {
  const params = new URLSearchParams({ utm_source: 'synoire' })
  return {
    kind: 'spotify',
    embedSrc: `https://open.spotify.com/embed/${path}?${params.toString()}`,
    label: 'Spotify',
  }
}

export function parseMediaUrl(input: string): ParsedMediaUrl | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const youtubeId = extractYouTubeId(trimmed)
  if (youtubeId) return buildYouTubeEmbed(youtubeId)

  const spotifyPath = extractSpotifyPath(trimmed)
  if (spotifyPath) return buildSpotifyEmbed(spotifyPath)

  return null
}
