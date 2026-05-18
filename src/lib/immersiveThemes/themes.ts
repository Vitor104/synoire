import type { ImmersiveTheme } from './types'

export const IMMERSIVE_THEMES: ImmersiveTheme[] = [
  {
    id: 'firefly',
    label: 'Vagalume (Padrão)',
    isPremium: false,
    audioFile: '/soundscapes/aurora-stillness.mp3',
    audioLabel: 'Aurora Stillness',
  },
  {
    id: 'rain',
    label: 'Chuva na Janela',
    isPremium: true,
    audioFile: '/soundscapes/rain-at-glass-night.mp3',
    audioLabel: 'Rain at Glass Night',
  },
  {
    id: 'forest',
    label: 'Floresta Noturna',
    isPremium: true,
    audioFile: '/soundscapes/firefly-study-grove.mp3',
    audioLabel: 'Firefly Study Grove',
  },
]

export const DEFAULT_IMMERSIVE_THEME_ID = 'firefly' as const

export function getImmersiveTheme(id: string): ImmersiveTheme | undefined {
  return IMMERSIVE_THEMES.find((t) => t.id === id)
}
