import type { MappedPartnership, PartnershipRow } from './types'

export function getPartnerUserId(row: PartnershipRow, currentUserId: string): string {
  return row.sender_id === currentUserId ? row.receiver_id : row.sender_id
}

export function mapPartnershipRow(
  row: PartnershipRow,
  currentUserId: string,
): MappedPartnership | null {
  if (row.status === 'rejected') return null

  const partnerUserId = getPartnerUserId(row, currentUserId)

  if (row.status === 'accepted') {
    return {
      id: row.id,
      partnerUserId,
      status: 'accepted',
      createdAt: row.created_at ?? new Date().toISOString(),
    }
  }

  if (row.status === 'pending') {
    const status =
      row.sender_id === currentUserId ? 'pending_outgoing' : 'pending_incoming'
    return {
      id: row.id,
      partnerUserId,
      status,
      createdAt: row.created_at ?? new Date().toISOString(),
    }
  }

  return null
}

export function mapPartnershipRows(
  rows: PartnershipRow[],
  currentUserId: string,
): MappedPartnership[] {
  return rows
    .map((row) => mapPartnershipRow(row, currentUserId))
    .filter((p): p is MappedPartnership => p !== null)
}
