import { useEffect, useMemo, useState } from 'react'
import { useGlobalPresence } from '@/contexts/GlobalPresenceContext'
import { getHubRoomsAdapter, type StudyRoom } from '@/lib/hubRooms'
import { filterVisibleRooms } from '@/lib/hubRooms/utils'
import { useRoomPresence } from '@/hooks/useRoomPresence'

const ONLINE_PRESENCE = {
  status: 'online' as const,
  current_room: null,
  room_id: null,
}

export function useStudyRoom(roomId: string | undefined) {
  const { trackPresence } = useGlobalPresence()
  const [room, setRoom] = useState<StudyRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const { presentCount, emptySince } = useRoomPresence(roomId)

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      setLoading(false)
      return
    }

    const adapter = getHubRoomsAdapter()
    let cancelled = false

    const load = async () => {
      try {
        const r = await adapter.getRoom(roomId)
        if (!cancelled) setRoom(r)
        if (r && !cancelled) {
          const synced = await adapter.syncTimerCatchUp(roomId)
          if (!cancelled && synced) setRoom(synced)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    const unsub = adapter.subscribe(() => {
      void load()
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [roomId])

  const roomWithPresence = useMemo(() => {
    if (!room) return null
    const merged: StudyRoom = {
      ...room,
      present_count: presentCount,
      empty_since: emptySince,
    }
    if (filterVisibleRooms([merged]).length === 0) return null
    return merged
  }, [room, presentCount, emptySince])

  useEffect(() => {
    if (!roomId) return

    if (roomWithPresence) {
      trackPresence({
        status: 'focando',
        current_room: roomWithPresence.name,
        room_id: roomWithPresence.id,
      })
    } else {
      trackPresence(ONLINE_PRESENCE)
    }

    return () => {
      trackPresence(ONLINE_PRESENCE)
    }
  }, [roomId, roomWithPresence, trackPresence])

  return { room: roomWithPresence, loading }
}
