import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

const REFRESH_MS = 5 * 60 * 1000

let cachedOffsetMs = 0
let lastRefreshMs = 0

export function getServerClockOffsetMs(): number {
  return cachedOffsetMs
}

export function getEffectiveNowMs(): number {
  return Date.now() + cachedOffsetMs
}

/** Estimates server time via RPC; returns offsetMs (server - local). */
export async function refreshServerClockOffset(): Promise<number> {
  if (!isSupabaseConfigured) {
    cachedOffsetMs = 0
    return 0
  }

  const supabase = getSupabase()
  if (!supabase) {
    cachedOffsetMs = 0
    return 0
  }

  const clientBefore = Date.now()
  const { data, error } = await supabase.rpc('get_server_time')
  if (error || data == null) {
    return cachedOffsetMs
  }

  const serverMs = new Date(String(data)).getTime()
  if (!Number.isFinite(serverMs)) {
    return cachedOffsetMs
  }

  const clientAfter = Date.now()
  const rtt = clientAfter - clientBefore
  const serverEstimate = serverMs + rtt / 2
  cachedOffsetMs = serverEstimate - clientAfter
  lastRefreshMs = clientAfter
  return cachedOffsetMs
}

export function shouldRefreshServerClock(): boolean {
  return Date.now() - lastRefreshMs >= REFRESH_MS
}

export const SERVER_CLOCK_REFRESH_MS = REFRESH_MS
