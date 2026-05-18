import { EMPTY_SINCE_STORAGE_KEY } from './types'

type EmptySinceMap = Record<string, string>

function readMap(): EmptySinceMap {
  if (typeof sessionStorage === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(EMPTY_SINCE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as EmptySinceMap
  } catch {
    return {}
  }
}

function writeMap(map: EmptySinceMap): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(EMPTY_SINCE_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // private mode / quota
  }
}

export function getStoredEmptySince(roomId: string): string | null {
  return readMap()[roomId] ?? null
}

export function setStoredEmptySince(roomId: string, value: string | null): void {
  const map = readMap()
  if (value === null) {
    delete map[roomId]
  } else {
    map[roomId] = value
  }
  writeMap(map)
}

export function clearEmptySinceStorageForTests(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(EMPTY_SINCE_STORAGE_KEY)
}
