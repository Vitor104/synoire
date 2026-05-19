import { getPartnerUserId, mapPartnershipRow } from './mapPartnershipRow'
import type { MappedPartnership, PartnershipRow } from './types'

export type PartnershipRealtimeEvent =
  | { type: 'INSERT'; row: PartnershipRow }
  | { type: 'UPDATE'; row: PartnershipRow }
  | { type: 'DELETE'; row: PartnershipRow }

export type ApplyPartnershipRealtimeResult = {
  partnerships: MappedPartnership[]
  removedPartnerUserId?: string
  partnerUserIdToEnrich?: string
  showIncomingInviteToast: boolean
}

function upsertPartnership(
  list: MappedPartnership[],
  item: MappedPartnership,
): MappedPartnership[] {
  const index = list.findIndex((p) => p.id === item.id)
  if (index === -1) return [...list, item]
  const next = [...list]
  next[index] = item
  return next
}

function removePartnership(list: MappedPartnership[], partnershipId: string): {
  partnerships: MappedPartnership[]
  removedPartnerUserId?: string
} {
  const existing = list.find((p) => p.id === partnershipId)
  return {
    partnerships: list.filter((p) => p.id !== partnershipId),
    removedPartnerUserId: existing?.partnerUserId,
  }
}

export function applyPartnershipRealtimeEvent(
  partnerships: MappedPartnership[],
  event: PartnershipRealtimeEvent,
  userId: string,
): ApplyPartnershipRealtimeResult {
  const emptySideEffects = {
    showIncomingInviteToast: false,
  } satisfies Pick<ApplyPartnershipRealtimeResult, 'showIncomingInviteToast'>

  if (event.type === 'DELETE') {
    const { partnerships: next, removedPartnerUserId } = removePartnership(
      partnerships,
      event.row.id,
    )
    return {
      ...emptySideEffects,
      partnerships: next,
      removedPartnerUserId:
        removedPartnerUserId ?? getPartnerUserId(event.row, userId),
    }
  }

  if (event.type === 'UPDATE') {
    if (event.row.status === 'rejected') {
      const { partnerships: next, removedPartnerUserId } = removePartnership(
        partnerships,
        event.row.id,
      )
      return {
        ...emptySideEffects,
        partnerships: next,
        removedPartnerUserId:
          removedPartnerUserId ?? getPartnerUserId(event.row, userId),
      }
    }

    const mapped = mapPartnershipRow(event.row, userId)
    if (!mapped) {
      const { partnerships: next, removedPartnerUserId } = removePartnership(
        partnerships,
        event.row.id,
      )
      return {
        ...emptySideEffects,
        partnerships: next,
        removedPartnerUserId:
          removedPartnerUserId ?? getPartnerUserId(event.row, userId),
      }
    }

    return {
      ...emptySideEffects,
      partnerships: upsertPartnership(partnerships, mapped),
      partnerUserIdToEnrich: mapped.partnerUserId,
    }
  }

  const mapped = mapPartnershipRow(event.row, userId)
  if (!mapped) {
    return { ...emptySideEffects, partnerships }
  }

  return {
    partnerships: upsertPartnership(partnerships, mapped),
    partnerUserIdToEnrich: mapped.partnerUserId,
    showIncomingInviteToast: event.row.receiver_id === userId,
  }
}
