import { useMemo } from 'react'
import type { PartnerPresenceEntry } from '@/lib/studyPartners'

export type { PartnerPresenceEntry }

/**
 * Partner online status and current room.
 * TODO: subscribe to Supabase Realtime presence channels (see useRoomPresence)
 * and aggregate by user_id in track payloads to populate isOnline / roomId / roomLabel.
 */
export function usePartnerPresence(
  partnerUserIds: string[],
): Map<string, PartnerPresenceEntry> {
  const idsKey = partnerUserIds.join(',')

  return useMemo(() => {
    const map = new Map<string, PartnerPresenceEntry>()
    for (const id of partnerUserIds) {
      if (!id) continue
      map.set(id, {
        isOnline: false,
        roomId: null,
        roomLabel: null,
      })
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable map per id set
  }, [idsKey])
}
