export const IMMERSIVE_THEME_IDS = ['firefly', 'rain', 'forest'] as const

export type ImmersiveThemeId = (typeof IMMERSIVE_THEME_IDS)[number]

export const SELECTED_THEME_STORAGE_KEY = 'synoire_selected_theme'

export type ImmersiveTheme = {
  id: ImmersiveThemeId
  label: string
  isPremium: boolean
  audioFile: string
  audioLabel: string
}

export function isImmersiveThemeId(value: unknown): value is ImmersiveThemeId {
  return (
    typeof value === 'string' &&
    (IMMERSIVE_THEME_IDS as readonly string[]).includes(value)
  )
}
