import { DEFAULT_IMMERSIVE_THEME_ID } from './themes'
import {
  isImmersiveThemeId,
  SELECTED_THEME_STORAGE_KEY,
  type ImmersiveThemeId,
} from './types'

export function readSelectedTheme(): ImmersiveThemeId {
  if (typeof localStorage === 'undefined') return DEFAULT_IMMERSIVE_THEME_ID
  try {
    const raw = localStorage.getItem(SELECTED_THEME_STORAGE_KEY)
    if (raw && isImmersiveThemeId(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_IMMERSIVE_THEME_ID
}

export function writeSelectedTheme(id: ImmersiveThemeId): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(SELECTED_THEME_STORAGE_KEY, id)
  } catch {
    /* quota or private mode */
  }
}
