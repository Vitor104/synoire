import { useCallback, useEffect, useMemo, useState } from 'react'
import { getHubRoomsAdapter, type StudyRoom } from '@/lib/hubRooms'
import { filterVisibleRooms } from '@/lib/hubRooms/utils'
import { useRoomPresence } from '@/hooks/useRoomPresence'

export function useStudyRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<StudyRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTick, setRefreshTick] = useState(0)
  const [completedTick, setCompletedTick] = useState(-1)
  const [loadedRoomId, setLoadedRoomId] = useState<string | undefined>(undefined)
  const { presentCount, emptySince } = useRoomPresence(roomId)

  const refreshRoom = useCallback(() => {
    setRefreshTick((tick) => tick + 1)
  }, [])

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      setLoading(false)
      setCompletedTick(refreshTick)
      setLoadedRoomId(undefined)
      return
    }

    setRoom(null)
    setLoading(true)

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
      } catch {
        if (!cancelled) setRoom(null)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setCompletedTick(refreshTick)
          setLoadedRoomId(roomId)
        }
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
  }, [roomId, refreshTick])

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

  const roomLoading = loading || (Boolean(roomId) && (loadedRoomId !== roomId || completedTick !== refreshTick))

  return { room: roomWithPresence, loading: roomLoading, presentCount, refreshRoom }
}
