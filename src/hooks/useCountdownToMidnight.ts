import { useEffect, useState } from 'react'
import {
  formatCountdown,
  msUntilMidnightInTz,
  STUDY_TIMEZONE,
} from '@/lib/dashboard/studyAnalytics'

export function useCountdownToMidnight(timeZone: string = STUDY_TIMEZONE) {
  const [remainingMs, setRemainingMs] = useState(() =>
    msUntilMidnightInTz(timeZone),
  )

  useEffect(() => {
    const tick = () => setRemainingMs(msUntilMidnightInTz(timeZone))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return formatCountdown(remainingMs)
}
