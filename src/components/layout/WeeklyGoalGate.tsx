import { Outlet } from 'react-router-dom'
import { OnboardingGoalModal } from '@/components/dashboard/OnboardingGoalModal'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUserStats } from '@/hooks/useUserStats'
import { needsWeeklyGoalOnboarding } from '@/lib/userStats'

export function WeeklyGoalGate() {
  const { stats, isLoading, isSaving, saveWeeklyGoal } = useUserStats()
  const prefersReducedMotion = usePrefersReducedMotion()

  const needsOnboarding =
    !isLoading && needsWeeklyGoalOnboarding(stats.weeklyGoalMinutes)

  return (
    <>
      <OnboardingGoalModal
        open={needsOnboarding}
        onSave={saveWeeklyGoal}
        prefersReducedMotion={prefersReducedMotion}
        isSubmitting={isSaving}
      />
      <div
        className={needsOnboarding ? 'pointer-events-none opacity-40' : ''}
        aria-hidden={needsOnboarding ? true : undefined}
      >
        <Outlet />
      </div>
    </>
  )
}
