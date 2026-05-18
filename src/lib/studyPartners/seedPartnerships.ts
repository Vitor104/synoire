import type { StoredPartnership } from './types'

/** Estado inicial quando localStorage está vazio. */
export function getSeedPartnerships(): StoredPartnership[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'ps-vitor',
      partnerUserId: 'user-vitor',
      status: 'accepted',
      createdAt: now,
    },
    {
      id: 'ps-carla',
      partnerUserId: 'user-carla',
      status: 'accepted',
      createdAt: now,
    },
    {
      id: 'ps-marina-in',
      partnerUserId: 'user-marina',
      status: 'pending_incoming',
      createdAt: now,
    },
  ]
}
