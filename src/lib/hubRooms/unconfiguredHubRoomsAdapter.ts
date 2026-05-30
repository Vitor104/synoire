import type { CreateRoomInput, HubRoomsAdapter } from './types'

/** No-op adapter when Supabase env vars are missing (production should always configure them). */
export const unconfiguredHubRoomsAdapter: HubRoomsAdapter = {
  listRooms: async () => [],
  getRoom: async () => null,
  createRoom: async (_input: CreateRoomInput) => {
    throw new Error('Supabase não configurado.')
  },
  startFocusTimer: async () => null,
  advanceTimerPhase: async () => null,
  syncTimerCatchUp: async () => null,
  incrementPresence: async () => {},
  decrementPresence: async () => {},
  subscribe: () => () => {},
}
