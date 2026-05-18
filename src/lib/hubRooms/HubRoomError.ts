export class HubRoomError extends Error {
  readonly code?: 'forbidden'

  constructor(message: string, code?: 'forbidden') {
    super(message)
    this.name = 'HubRoomError'
    this.code = code
  }
}
