import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StudyRoom } from '@/lib/hubRooms/types'
import { useRoomEntry } from './useRoomEntry'

const refreshRoomMock = vi.fn()
const canJoinRoomMock = vi.fn()
const redeemRoomInviteTokenMock = vi.fn()

let studyRoomState: {
  room: StudyRoom | null
  loading: boolean
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'guest-1' },
  }),
}))

vi.mock('@/hooks/useStudyRoom', () => ({
  useStudyRoom: () => ({
    room: studyRoomState.room,
    loading: studyRoomState.loading,
    presentCount: 0,
    refreshRoom: refreshRoomMock,
  }),
}))

vi.mock('@/lib/roomAccess/canJoinRoom', () => ({
  canJoinRoom: (...args: unknown[]) => canJoinRoomMock(...args),
}))

vi.mock('@/lib/roomAccess/roomInviteTokens', () => ({
  redeemRoomInviteToken: (...args: unknown[]) => redeemRoomInviteTokenMock(...args),
}))

function createWrapper(path: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  }
}

const privateRoom: StudyRoom = {
  id: 'room-1',
  hub_slug: 'mentoria-pf',
  name: 'Sala PF',
  focus_cycle: '25/5',
  is_private: true,
  creator_id: 'creator-1',
  current_timer_state: {
    status: 'idle',
    started_at: '2026-05-26T21:00:00.000Z',
    focus_sec: 1500,
    break_sec: 300,
  },
  present_count: 0,
  empty_since: null,
  created_at: '2026-05-26T21:00:00.000Z',
}

describe('useRoomEntry invite links', () => {
  beforeEach(() => {
    refreshRoomMock.mockReset()
    canJoinRoomMock.mockReset()
    redeemRoomInviteTokenMock.mockReset()
    studyRoomState = { room: null, loading: true }
    refreshRoomMock.mockImplementation(() => {
      studyRoomState = { room: privateRoom, loading: false }
    })
  })

  it('reloads the room after redeeming a valid invite', async () => {
    redeemRoomInviteTokenMock.mockResolvedValue({ ok: true, data: true })
    canJoinRoomMock.mockResolvedValue({ status: 'allowed' })

    const { result, rerender } = renderHook(() => useRoomEntry('room-1'), {
      wrapper: createWrapper('/salas/room-1?invite=token-123'),
    })

    await waitFor(() => {
      expect(redeemRoomInviteTokenMock).toHaveBeenCalledWith('room-1', 'token-123', 'guest-1')
    })

    expect(refreshRoomMock).toHaveBeenCalled()
    studyRoomState = { room: privateRoom, loading: false }
    rerender()

    await waitFor(() => {
      expect(result.current.entryStatus).toBe('ready')
    })

    expect(canJoinRoomMock).toHaveBeenCalledWith('room-1', 'guest-1')
    expect(result.current.room?.id).toBe('room-1')
  })

  it('returns invalid_invite when the token cannot be redeemed', async () => {
    studyRoomState = { room: null, loading: false }
    redeemRoomInviteTokenMock.mockResolvedValue({ ok: true, data: false })
    canJoinRoomMock.mockResolvedValue({ status: 'denied_private' })

    const { result } = renderHook(() => useRoomEntry('room-1'), {
      wrapper: createWrapper('/salas/room-1?invite=expired-token'),
    })

    await waitFor(() => {
      expect(result.current.entryStatus).toBe('invalid_invite')
    })

    expect(result.current.entryMessage).toBe('Link de convite inválido ou expirado.')
  })
})
