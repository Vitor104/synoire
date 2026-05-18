import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserStats, type UserStatsView } from '@/lib/userStats'

const DEFAULT_STATS: UserStatsView = {
  currentStreak: 0,
  totalHours: 0,
  dailyGoalMinutes: 240,
}

export function useUserStats() {
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<UserStatsView>(DEFAULT_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const userId = user?.id
    if (!userId) {
      setStats(DEFAULT_STATS)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await getUserStats(userId)
    if (result.ok) {
      setStats(result.data)
      setError(null)
    } else {
      setStats(DEFAULT_STATS)
      setError(result.message)
    }
    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    if (authLoading) return
    void refresh()
  }, [authLoading, refresh])

  return {
    stats,
    isLoading: authLoading || isLoading,
    error,
    refresh,
  }
}
