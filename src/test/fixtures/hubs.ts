import type { HubView } from '@/lib/hubs/types'

export const TEST_HUBS: HubView[] = [
  {
    id: 'hub-pf',
    slug: 'pf',
    name: 'Polícia Federal',
    shortLabel: 'PF',
    accentStripe: 'bg-blue-500',
    accentBadge: 'bg-blue-500/20',
  },
  {
    id: 'hub-bb',
    slug: 'bb',
    name: 'Banco do Brasil',
    shortLabel: 'BB',
    accentStripe: 'bg-yellow-500',
    accentBadge: 'bg-yellow-500/20',
  },
]
