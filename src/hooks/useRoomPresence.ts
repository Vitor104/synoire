import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { setStoredEmptySince, getStoredEmptySince } from '@/lib/hubRooms/emptySinceStorage'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from '@/lib/hubRooms/demo'

function countPresenceKeys(state: Record<string, unknown[]>): number {
  return Object.keys(state).length
}

export type RoomPresenceState = {
  presentCount: number
  emptySince: string | null
}

export function useRoomPresence(roomId: string | undefined): RoomPresenceState {
  const { user } = useAuth()
  const [presentCount, setPresentCount] = useState(0)
  const [emptySince, setEmptySince] = useState<string | null>(() =>
    roomId ? getStoredEmptySince(roomId) : null,
  )
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (!roomId || !user?.id) {
      setPresentCount(0)
      return
    }

    const demoMode = isDemoMode || !isSupabaseConfigured
    if (demoMode) {
      setPresentCount(1)
      setEmptySince(null)
      return
    }

    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase.channel(`room_presence:${roomId}`, {
      config: { presence: { key: user.id } },
    })

    const syncCount = () => {
      const state = channel.presenceState() as Record<string, unknown[]>
      const count = countPresenceKeys(state)
      setPresentCount(count)

      const prev = prevCountRef.current
      if (prev > 0 && count === 0) {
        const now = new Date().toISOString()
        setEmptySince(now)
        setStoredEmptySince(roomId, now)
      } else if (count > 0) {
        setEmptySince(null)
        setStoredEmptySince(roomId, null)
      } else {
        const stored = getStoredEmptySince(roomId)
        setEmptySince(stored)
      }
      prevCountRef.current = count
    }

    channel
      .on('presence', { event: 'sync' }, syncCount)
      .on('presence', { event: 'join' }, syncCount)
      .on('presence', { event: 'leave' }, syncCount)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
          syncCount()
        }
      })

    const onUnload = () => {
      void channel.untrack()
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('beforeunload', onUnload)
      void channel.untrack()
      void supabase.removeChannel(channel)
    }
  }, [roomId, user?.id])

  return { presentCount, emptySince }
}

export function useRoomsPresenceMap(
  roomIds: string[],
): Record<string, RoomPresenceState> {
  const { user } = useAuth()
  const [map, setMap] = useState<Record<string, RoomPresenceState>>({})

  const idsKey = roomIds.join(',')

  useEffect(() => {
    if (!user?.id || roomIds.length === 0) {
      setMap({})
      return
    }

    const demoMode = isDemoMode || !isSupabaseConfigured
    if (demoMode) {
      const demoMap: Record<string, RoomPresenceState> = {}
      for (const id of roomIds) {
        demoMap[id] = { presentCount: 0, emptySince: getStoredEmptySince(id) }
      }
      setMap(demoMap)
      return
    }

    const supabase = getSupabase()
    if (!supabase) return

    const channels = roomIds.map((roomId) => {
      const channel = supabase.channel(`room_presence_list:${roomId}`, {
        config: { presence: { key: `${user.id}:${roomId}` } },
      })

      const syncCount = () => {
        const state = channel.presenceState() as Record<string, unknown[]>
        const count = countPresenceKeys(state)
        setMap((prev) => {
          const prevEntry = prev[roomId]
          const prevCount = prevEntry?.presentCount ?? 0
          let nextEmpty = prevEntry?.emptySince ?? getStoredEmptySince(roomId)

          if (prevCount > 0 && count === 0) {
            nextEmpty = new Date().toISOString()
            setStoredEmptySince(roomId, nextEmpty)
          } else if (count > 0) {
            nextEmpty = null
            setStoredEmptySince(roomId, null)
          }

          return {
            ...prev,
            [roomId]: { presentCount: count, emptySince: nextEmpty },
          }
        })
      }

      channel
        .on('presence', { event: 'sync' }, syncCount)
        .on('presence', { event: 'join' }, syncCount)
        .on('presence', { event: 'leave' }, syncCount)
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            })
            syncCount()
          }
        })

      return { roomId, channel }
    })

    return () => {
      for (const { channel } of channels) {
        void channel.untrack()
        void supabase.removeChannel(channel)
      }
    }
  }, [idsKey, user?.id])

  return map
}
