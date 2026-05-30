import type { RoomChatAdapter } from './types'

/** No-op adapter when Supabase env vars are missing. */
export const unconfiguredRoomChatAdapter: RoomChatAdapter = {
  fetchRecent: async () => [],
  send: async () => {
    throw new Error('Supabase não configurado.')
  },
  subscribe: () => () => {},
}
