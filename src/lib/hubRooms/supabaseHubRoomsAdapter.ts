import { getHubBySlug } from '@/lib/hubs'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { createRoomApi } from './createRoom'
import { mockHubRoomsAdapter } from './mockHubRoomsAdapter'
import { getRoomById } from './getRoomById'
import { listRoomsByHub } from './listRoomsByHub'
import { HubRoomError } from './HubRoomError'
import { patchRoomTimer } from './patchRoomTimer'
import {
  catchUpTimerState,
  nextAdvancedTimerState,
} from './timerMutations'
import type { HubRoomsAdapter } from './types'
import { filterVisibleRooms } from './utils'

async function resolveHubId(hubSlug: string): Promise<string | null> {
  const result = await getHubBySlug(hubSlug)
  if (!result.ok || !result.data) return null
  return result.data.id
}

function throwOnError<T>(result: { ok: true; data: T } | { ok: false; message: string; code?: 'forbidden' }): T {
  if (!result.ok) {
    throw new HubRoomError(result.message, result.code)
  }
  return result.data
}

export const supabaseHubRoomsAdapter: HubRoomsAdapter = {
  async listRooms(hubSlug) {
    const hubId = await resolveHubId(hubSlug)
    if (!hubId) return []
    const result = await listRoomsByHub(hubId, hubSlug)
    const rooms = throwOnError(result)
    return filterVisibleRooms(rooms)
  },

  async getRoom(roomId) {
    const result = await getRoomById(roomId)
    const room = throwOnError(result)
    if (!room) return null
    if (filterVisibleRooms([room]).length === 0) return null
    return room
  },

  async createRoom(input) {
    const result = await createRoomApi(input)
    return throwOnError(result)
  },

  async syncTimerCatchUp(roomId, now) {
    const current = await this.getRoom(roomId)
    if (!current) return null
    const next = catchUpTimerState(current, now)
    if (!next) return current
    const result = await patchRoomTimer(roomId, next, current.hub_slug)
    return throwOnError(result)
  },

  async startFocusTimer(roomId, now) {
    return this.syncTimerCatchUp(roomId, now)
  },

  async advanceTimerPhase(roomId, now) {
    const current = await this.getRoom(roomId)
    if (!current) return null
    if (catchUpTimerState(current, now)) {
      return this.syncTimerCatchUp(roomId, now)
    }
    const next = nextAdvancedTimerState(current, now)
    if (!next) return current
    const result = await patchRoomTimer(roomId, next, current.hub_slug)
    return throwOnError(result)
  },

  async incrementPresence() {
    // Presence is handled via Realtime Presence hooks.
  },

  async decrementPresence() {
    // Presence is handled via Realtime Presence hooks.
  },

  subscribe(onChange, hubSlug, roomId) {
    if (!isSupabaseConfigured) return () => {}
    const supabase = getSupabase()
    if (!supabase) return () => {}

    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    void (async () => {
      const hubId = hubSlug ? await resolveHubId(hubSlug) : null
      if (cancelled) return

      const channelName = roomId
        ? `room_timer:${roomId}`
        : hubId
          ? `hub_rooms:${hubId}`
          : 'hub_rooms:all'
      const changeConfig: {
        event: '*'
        schema: 'public'
        table: 'rooms'
        filter?: string
      } = {
        event: '*',
        schema: 'public',
        table: 'rooms',
      }
      if (roomId) {
        changeConfig.filter = `id=eq.${roomId}`
      } else if (hubId) {
        changeConfig.filter = `hub_id=eq.${hubId}`
      }

      channel = supabase
        .channel(channelName)
        .on('postgres_changes', changeConfig, () => {
          onChange()
        })
        .subscribe()
    })()

    return () => {
      cancelled = true
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  },
}

export function getHubRoomsAdapter(): HubRoomsAdapter {
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'
  if (isSupabaseConfigured && !demoMode) {
    return supabaseHubRoomsAdapter
  }
  return mockHubRoomsAdapter
}
