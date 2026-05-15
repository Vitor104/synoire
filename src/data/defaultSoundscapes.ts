/** Faixas Synoire Default — MP3 em `public/soundscapes/` (stubs silenciosos até assets finais). */
export type DefaultSoundscape = {
  id: string
  label: string
  file: string
}

export const DEFAULT_SOUNDSCAPES: DefaultSoundscape[] = [
  { id: 'night-bloom', label: 'Night Bloom', file: '/soundscapes/night-bloom.mp3' },
  { id: 'silent-orbit', label: 'Silent Orbit', file: '/soundscapes/silent-orbit.mp3' },
  { id: 'firelight', label: 'Firelight', file: '/soundscapes/firelight.mp3' },
  { id: 'nocturne-flow', label: 'Nocturne Flow', file: '/soundscapes/nocturne-flow.mp3' },
  { id: 'forest-pulse', label: 'Forest Pulse', file: '/soundscapes/forest-pulse.mp3' },
]
