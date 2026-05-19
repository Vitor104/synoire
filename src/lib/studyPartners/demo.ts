import type { MappedPartnership, PartnershipRow } from './types'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export function listDemoPartnerships(_userId: string): MappedPartnership[] {
  return []
}

export function demoPartnershipRows(): PartnershipRow[] {
  return []
}
