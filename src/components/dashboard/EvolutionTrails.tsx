import { useCallback, useMemo, useState } from 'react'
import { CreateGoalModal } from '@/components/dashboard/CreateGoalModal'
import { LockIcon } from '@/components/premium/LockIcon'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUserGoals } from '@/hooks/useUserGoals'
import { paywallTeaserGoals } from '@/lib/dashboard/paywallTeaserGoals'
import type { CreateUserGoalInput, UserGoalView } from '@/lib/goals'

const EMPTY_GOALS_MESSAGE = 'Crie sua primeira meta com o botão acima.'

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`
}

function goalProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, (current / target) * 100)
}

type TrailsContentProps = {
  goals: UserGoalView[]
  onNewGoal: () => void
  emptyMessage?: string
  isLoading?: boolean
}

function TrailsContent({ goals, onNewGoal, emptyMessage, isLoading }: TrailsContentProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-primary">Trilhas de Evolução</h2>
        <button
          type="button"
          onClick={onNewGoal}
          className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-secondary transition hover:border-white/20 hover:text-primary"
        >
          + Nova Meta
        </button>
      </div>
      {isLoading ? (
        <p className="mt-6 text-sm text-secondary">Carregando metas…</p>
      ) : goals.length === 0 && emptyMessage ? (
        <p className="mt-6 text-sm text-secondary">{emptyMessage}</p>
      ) : (
        <ul className="mt-6 list-none space-y-5 p-0">
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} />
          ))}
        </ul>
      )}
    </>
  )
}

type GoalRowProps = {
  goal: UserGoalView
}

function GoalRow({ goal }: GoalRowProps) {
  const pct = goalProgress(goal.currentHours, goal.targetHours)
  const complete = pct >= 100

  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <span className="block truncate text-sm text-primary">{goal.hubName}</span>
          <span className="block truncate text-xs text-secondary">
            {goal.subjectName} · {goal.periodLabel}
          </span>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-secondary">
          {formatHours(goal.currentHours)} / {formatHours(goal.targetHours)}
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-sm bg-white/10"
        role="progressbar"
        aria-valuenow={goal.currentHours}
        aria-valuemin={0}
        aria-valuemax={goal.targetHours}
        aria-label={`Progresso em ${goal.hubName}`}
      >
        <div
          className={`h-full rounded-sm bg-firefly ${
            complete ? 'shadow-[0_0_10px_#a3a34f]' : ''
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  )
}

export function EvolutionTrails() {
  const { hasGlowAccess, openPaywall } = useUserPlan()
  const { goals, isLoading, isCreating, createGoal, refresh } = useUserGoals()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [modalOpen, setModalOpen] = useState(false)

  const displayGoals = useMemo(() => {
    if (hasGlowAccess) return goals
    if (goals.length > 0) return goals
    return paywallTeaserGoals()
  }, [hasGlowAccess, goals])

  const emptyMessage = useMemo(() => {
    if (!hasGlowAccess) return undefined
    if (isLoading) return undefined
    if (goals.length > 0) return undefined
    return EMPTY_GOALS_MESSAGE
  }, [hasGlowAccess, isLoading, goals.length])

  const handleNewGoal = useCallback(() => {
    if (!hasGlowAccess) {
      openPaywall()
      return
    }
    setModalOpen(true)
  }, [hasGlowAccess, openPaywall])

  const handleCreate = useCallback(
    async (input: CreateUserGoalInput) => {
      const result = await createGoal(input)
      if (!result.ok) {
        if (result.code === 'forbidden') {
          openPaywall()
        }
        throw new Error(result.message)
      }
      await refresh()
    },
    [createGoal, refresh, openPaywall],
  )

  return (
    <section className="rounded-2xl border border-white/5 bg-panel p-6">
      {hasGlowAccess ? (
        <TrailsContent
          goals={displayGoals}
          onNewGoal={handleNewGoal}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
        />
      ) : (
        <div className="relative">
          <div className="pointer-events-none select-none blur-md">
            <TrailsContent goals={displayGoals} onNewGoal={() => {}} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-night/20 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => openPaywall()}
              className="pointer-events-auto flex items-center gap-2 rounded-xl border border-firefly/30 bg-panel/90 px-4 py-2.5 text-sm font-medium text-firefly shadow-[0_0_24px_-4px_rgba(163,163,79,0.25)] transition hover:border-firefly/50 hover:brightness-110"
            >
              <LockIcon className="h-4 w-4 text-firefly" />
              Desbloquear Trilhas de Evolução
            </button>
          </div>
        </div>
      )}

      <CreateGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        prefersReducedMotion={prefersReducedMotion}
        isSubmitting={isCreating}
      />
    </section>
  )
}
