import { useEffect, useState } from 'react'
import {
  getServerClockOffsetMs,
  refreshServerClockOffset,
  SERVER_CLOCK_REFRESH_MS,
  shouldRefreshServerClock,
} from '@/lib/time/serverClock'

/** Keeps local timer display aligned with Supabase server time. */
export function useServerClockOffset(enabled: boolean): number {
  const [offsetMs, setOffsetMs] = useState(() => getServerClockOffsetMs())

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const sync = async () => {
      const next = await refreshServerClockOffset()
      if (!cancelled) setOffsetMs(next)
    }

    void sync()

    const id = window.setInterval(() => {
      if (shouldRefreshServerClock()) void sync()
    }, SERVER_CLOCK_REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [enabled])

  return offsetMs
}
