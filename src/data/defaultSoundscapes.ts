/** Faixas Synoire Default — MP3 em `public/soundscapes/` (stubs silenciosos até assets finais). */
export type DefaultSoundscape = {
  id: string
  label: string
  file: string
}

export const DEFAULT_SOUNDSCAPES: DefaultSoundscape[] = [
  { id: 'aurora-stillness', label: 'Aurora Stillness', file: '/soundscapes/aurora-stillness.mp3' },
  { id: 'firefly-study-grove', label: 'Firefly Study Grove', file: '/soundscapes/firefly-study-grove.mp3' },
  { id: 'rain-at-glass-night', label: 'Rain at Glass Night', file: '/soundscapes/rain-at-glass-night.mp3' },
]
