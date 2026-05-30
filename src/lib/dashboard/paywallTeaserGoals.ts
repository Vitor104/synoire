import type { UserGoalView } from '@/lib/goals'

/** Placeholder goals for free-tier paywall teaser when user has no real goals. */
export function paywallTeaserGoals(): UserGoalView[] {
  return [
    {
      id: 'teaser-pf',
      hubId: null,
      hubName: 'Polícia Federal',
      subjectName: 'Revisão Geral',
      targetHours: 10,
      currentHours: 7.5,
      period: 'weekly',
      periodLabel: 'Semanal',
    },
    {
      id: 'teaser-bb',
      hubId: null,
      hubName: 'Banco do Brasil',
      subjectName: 'Português',
      targetHours: 8,
      currentHours: 8,
      period: 'weekly',
      periodLabel: 'Semanal',
    },
  ]
}
