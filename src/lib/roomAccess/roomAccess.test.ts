import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearRoomAccessForTests,
  grantRoomAccess,
  hasRoomAccess,
  listGrantsForRoom,
} from './storage'

beforeEach(() => {
  clearRoomAccessForTests()
})

describe('room access grants', () => {
  it('grants access once per room and user', () => {
    const first = grantRoomAccess('room-1', 'user-vitor')
    const second = grantRoomAccess('room-1', 'user-vitor')

    expect(first.grantedAt).toBe(second.grantedAt)
    expect(listGrantsForRoom('room-1')).toHaveLength(1)
    expect(hasRoomAccess('room-1', 'user-vitor')).toBe(true)
    expect(hasRoomAccess('room-1', 'user-carla')).toBe(false)
  })

  it('lists grants per room', () => {
    grantRoomAccess('room-a', 'user-vitor')
    grantRoomAccess('room-a', 'user-carla')
    grantRoomAccess('room-b', 'user-vitor')

    expect(listGrantsForRoom('room-a')).toHaveLength(2)
    expect(listGrantsForRoom('room-b')).toHaveLength(1)
  })
})
