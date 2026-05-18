export const CUSTOM_MEDIA_URL_STORAGE_KEY = 'synoire_custom_media_url'

export function readCustomMediaUrl(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(CUSTOM_MEDIA_URL_STORAGE_KEY)
    return raw && raw.trim().length > 0 ? raw.trim() : null
  } catch {
    return null
  }
}

export function writeCustomMediaUrl(url: string | null): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (url) {
      localStorage.setItem(CUSTOM_MEDIA_URL_STORAGE_KEY, url)
    } else {
      localStorage.removeItem(CUSTOM_MEDIA_URL_STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
}
