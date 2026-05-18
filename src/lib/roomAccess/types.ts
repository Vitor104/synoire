export const ROOM_ACCESS_STORAGE_KEY = 'synoire_room_access'

export type RoomAccessGrant = {
  roomId: string
  userId: string
  grantedAt: string
}
