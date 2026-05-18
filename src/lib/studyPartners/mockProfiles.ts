import type { MockUserProfile } from './types'

/** Catálogo local de estudantes (simula profiles + user_stats). */
export const MOCK_USER_PROFILES: readonly MockUserProfile[] = [
  {
    id: 'user-vitor',
    username: 'vitor',
    displayName: 'Vitor',
    avatarUrl: '',
    currentStreak: 12,
    isOnline: true,
    currentRoomLabel: 'Direito Administrativo • 50/10',
    currentRoomId: 'demo',
  },
  {
    id: 'user-carla',
    username: 'carla_estudos',
    displayName: 'Carla',
    avatarUrl: '',
    currentStreak: 5,
    isOnline: false,
    currentRoomLabel: null,
    currentRoomId: null,
  },
  {
    id: 'user-lucas',
    username: 'lucas_pf',
    displayName: 'Lucas',
    avatarUrl: '',
    currentStreak: 21,
    isOnline: true,
    currentRoomLabel: 'Dir. Constitucional • 50/10',
    currentRoomId: 'demo',
  },
  {
    id: 'user-marina',
    username: 'marina_concursos',
    displayName: 'Marina',
    avatarUrl: '',
    currentStreak: 3,
    isOnline: false,
    currentRoomLabel: null,
    currentRoomId: null,
  },
  {
    id: 'user-pedro',
    username: 'pedro_tj',
    displayName: 'Pedro',
    avatarUrl: '',
    currentStreak: 8,
    isOnline: false,
    currentRoomLabel: null,
    currentRoomId: null,
  },
] as const

export function findProfileByUsername(username: string): MockUserProfile | undefined {
  const normalized = username.trim().replace(/^@/, '').toLowerCase()
  if (!normalized) return undefined
  return MOCK_USER_PROFILES.find((p) => p.username.toLowerCase() === normalized)
}

export function findProfileById(userId: string): MockUserProfile | undefined {
  return MOCK_USER_PROFILES.find((p) => p.id === userId)
}
