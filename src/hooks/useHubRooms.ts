import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useHubs } from '@/contexts/HubsContext'
import {
  getHubRoomsAdapter,
  HubRoomError,
  type CreateRoomInput,
  type FocusCycle,
  type StudyRoom,
} from '@/lib/hubRooms'
import { filterVisibleRooms } from '@/lib/hubRooms/utils'
import { useRoomsPresenceMap } from '@/hooks/useRoomPresence'

export type CreateRoomResult =
  | { ok: true; room: StudyRoom }
  | { ok: false; message: string; code?: 'forbidden' }

export function useHubRooms(hubSlug: string | undefined) {
  const { user } = useAuth()
  const { getHubId } = useHubs()
  const [rooms, setRooms] = useState<StudyRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const adapter = getHubRoomsAdapter()

  const refresh = useCallback(async () => {
    if (!hubSlug) {
      setRooms([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const list = await adapter.listRooms(hubSlug)
      setRooms(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar salas')
    } finally {
      setIsLoading(false)
    }
  }, [hubSlug, adapter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    return adapter.subscribe(() => {
      void refresh()
    }, hubSlug)
  }, [adapter, refresh, hubSlug])

  const roomIds = useMemo(() => rooms.map((r) => r.id), [rooms])
  const presenceMap = useRoomsPresenceMap(roomIds)

  const roomsWithPresence = useMemo(() => {
    const merged = rooms.map((room) => {
      const presence = presenceMap[room.id]
      if (!presence) return room
      return {
        ...room,
        present_count: presence.presentCount,
        empty_since: presence.emptySince,
      }
    })
    return filterVisibleRooms(merged)
  }, [rooms, presenceMap])

  const createRoom = useCallback(
    async (
      theme: string,
      focusCycle: FocusCycle,
      isPrivate = false,
    ): Promise<CreateRoomResult> => {
      if (!hubSlug) {
        return { ok: false, message: 'Hub inválido.' }
      }
      if (!user?.id) {
        return { ok: false, message: 'Entre na sua conta para criar uma sala.' }
      }
      const hubId = getHubId(hubSlug)
      if (!hubId) {
        return { ok: false, message: 'Hub não encontrado.' }
      }

      const input: CreateRoomInput = {
        hubSlug,
        hubId,
        creatorId: user.id,
        theme,
        focusCycle,
        isPrivate,
      }

      try {
        const room = await adapter.createRoom(input)
        await refresh()
        return { ok: true, room }
      } catch (e) {
        if (e instanceof HubRoomError) {
          return { ok: false, message: e.message, code: e.code }
        }
        return {
          ok: false,
          message: e instanceof Error ? e.message : 'Erro ao criar sala',
        }
      }
    },
    [hubSlug, user?.id, getHubId, adapter, refresh],
  )

  return { rooms: roomsWithPresence, isLoading, error, createRoom, refresh }
}
