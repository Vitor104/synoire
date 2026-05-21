import { SAMPLE_HUBS } from '@/data/sampleHubs'

export type RoomDisplayTitleState =
  | 'loading'
  | 'ready'
  | 'denied_private'
  | 'not_found'
  | 'error'
  | 'default'

export function formatRoomDisplayTitle(
  state: RoomDisplayTitleState,
  studyName?: string | null,
  roomId?: string,
): string {
  if (studyName?.trim()) return studyName.trim()

  switch (state) {
    case 'loading':
      return 'Carregando sala…'
    case 'denied_private':
      return 'Sala privada'
    case 'not_found':
      return 'Sala não encontrada'
    case 'error':
      return 'Não foi possível abrir a sala'
    case 'ready':
      return 'Sala de estudo'
    default:
      break
  }

  if (!roomId) return 'Sala de estudo'
  const hub = SAMPLE_HUBS.find((h) => h.slug === roomId)
  if (hub) return `Sala ${hub.name}`
  if (roomId === 'demo') return 'Sala de estudo'

  return 'Sala de estudo'
}
