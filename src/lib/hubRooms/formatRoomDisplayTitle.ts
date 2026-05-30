export type RoomDisplayTitleState =
  | 'loading'
  | 'ready'
  | 'denied_private'
  | 'invalid_invite'
  | 'not_found'
  | 'error'
  | 'default'

export function formatRoomDisplayTitle(
  state: RoomDisplayTitleState,
  studyName?: string | null,
  _roomId?: string,
): string {
  if (studyName?.trim()) return studyName.trim()

  switch (state) {
    case 'loading':
      return 'Carregando sala…'
    case 'denied_private':
    case 'invalid_invite':
      return 'Sala privada'
    case 'not_found':
      return 'Sala não encontrada'
    case 'error':
      return 'Não foi possível abrir a sala'
    case 'ready':
      return 'Sala de estudo'
    default:
      return 'Sala de estudo'
  }
}
