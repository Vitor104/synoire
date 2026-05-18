import { SAMPLE_HUBS } from '@/data/sampleHubs'
import type { UserGoalView } from '@/lib/goals'

/** Placeholder goals for free-tier paywall teaser when user has no real goals. */
export function paywallTeaserGoals(): UserGoalView[] {
  const pf = SAMPLE_HUBS.find((h) => h.slug === 'pf')
  const bb = SAMPLE_HUBS.find((h) => h.slug === 'bb')

  return [
    {
      id: 'teaser-pf',
      hubId: null,
      hubName: pf?.name ?? 'Polícia Federal',
      subjectName: 'Revisão Geral',
      targetHours: 10,
      currentHours: 7.5,
      period: 'weekly',
      periodLabel: 'Semanal',
    },
    {
      id: 'teaser-bb',
      hubId: null,
      hubName: bb?.name ?? 'Banco do Brasil',
      subjectName: 'Português',
      targetHours: 8,
      currentHours: 8,
      period: 'weekly',
      periodLabel: 'Semanal',
    },
  ]
}
