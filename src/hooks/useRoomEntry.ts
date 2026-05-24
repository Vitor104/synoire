import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStudyRoom } from '@/hooks/useStudyRoom'
import { canJoinRoom, type CanJoinRoomResult } from '@/lib/roomAccess/canJoinRoom'
import { redeemRoomInviteToken } from '@/lib/roomAccess/roomInviteTokens'
import type { StudyRoom } from '@/lib/hubRooms'

export type RoomEntryStatus =
  | 'loading'
  | 'ready'
  | 'denied_private'
  | 'invalid_invite'
  | 'not_found'
  | 'error'

export function useRoomEntry(roomId: string | undefined): {
  room: StudyRoom | null
  entryStatus: RoomEntryStatus
  entryMessage: string | null
  roomLoading: boolean
  presentCount: number
} {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')?.trim() || null
  const { room, loading: roomLoading, presentCount } = useStudyRoom(roomId)
  const [joinResult, setJoinResult] = useState<CanJoinRoomResult | null>(null)
  const [joinLoading, setJoinLoading] = useState(Boolean(roomId && user?.id))
  const [redeemState, setRedeemState] = useState<'idle' | 'loading' | 'invalid' | 'ok'>('idle')

  useEffect(() => {
    if (!roomId) {
      setJoinResult(null)
      setJoinLoading(false)
      setRedeemState('idle')
      return
    }

    if (!user?.id) {
      setJoinResult({ status: 'denied_private' })
      setJoinLoading(false)
      setRedeemState('idle')
      return
    }

    let cancelled = false
    setJoinLoading(true)

    const run = async () => {
      if (inviteToken) {
        setRedeemState('loading')
        const redeem = await redeemRoomInviteToken(roomId, inviteToken, user.id)
        if (cancelled) return
        if (!redeem.ok) {
          setRedeemState('idle')
          setJoinResult({ status: 'error', message: redeem.message })
          setJoinLoading(false)
          return
        }
        setRedeemState(redeem.data ? 'ok' : 'invalid')
      } else {
        setRedeemState('idle')
      }

      const result = await canJoinRoom(roomId, user.id)
      if (!cancelled) {
        setJoinResult(result)
        setJoinLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [roomId, user?.id, inviteToken])

  const entryStatus = useMemo((): RoomEntryStatus => {
    if (!roomId) return 'not_found'
    if (roomLoading || joinLoading) return 'loading'

    if (joinResult?.status === 'error') return 'error'
    if (redeemState === 'invalid') return 'invalid_invite'
    if (joinResult?.status === 'denied_private') return 'denied_private'
    if (joinResult?.status === 'not_found') return 'not_found'

    if (joinResult?.status === 'allowed') {
      if (room) return 'ready'
      return 'not_found'
    }

    return 'not_found'
  }, [roomId, roomLoading, joinLoading, joinResult, room, redeemState])

  const entryMessage = useMemo(() => {
    if (joinResult?.status === 'error') return joinResult.message
    if (entryStatus === 'invalid_invite') {
      return 'Link de convite inválido ou expirado.'
    }
    if (entryStatus === 'denied_private') {
      return inviteToken
        ? 'Link de convite inválido ou expirado.'
        : 'Peça um link de convite ao criador da sala para entrar.'
    }
    return null
  }, [joinResult, entryStatus, inviteToken])

  return {
    room: entryStatus === 'ready' ? room : null,
    entryStatus,
    entryMessage,
    roomLoading: roomLoading || joinLoading,
    presentCount,
  }
}
