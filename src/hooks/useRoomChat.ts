import { useCallback, useEffect, useRef, useState } from 'react'
import {
  appendMessageIfNew,
  getRoomChatAdapter,
  isValidChatContent,
  resolveCurrentChatUserId,
  ROOM_CHAT_FETCH_LIMIT,
  sortMessagesAsc,
  trimChatContent,
  type RoomChatMessage,
} from '@/lib/roomChat'

type UseRoomChatOptions = {
  roomId: string | undefined
  panelOpen: boolean
  enabled?: boolean
}

export function useRoomChat({
  roomId,
  panelOpen,
  enabled = true,
}: UseRoomChatOptions) {
  const [messages, setMessages] = useState<RoomChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState('')

  const adapterRef = useRef(getRoomChatAdapter())
  const panelOpenRef = useRef(panelOpen)
  const currentUserIdRef = useRef(currentUserId)

  panelOpenRef.current = panelOpen
  currentUserIdRef.current = currentUserId

  const handleIncoming = useCallback((msg: RoomChatMessage) => {
    setMessages((prev) => appendMessageIfNew(prev, msg))

    const isOwn = msg.user_id === currentUserIdRef.current
    if (!panelOpenRef.current && !isOwn) {
      setUnreadCount((c) => c + 1)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void resolveCurrentChatUserId().then((id) => {
      if (!cancelled) setCurrentUserId(id)
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !roomId) {
      setMessages([])
      return
    }

    let cancelled = false
    const adapter = adapterRef.current

    setLoading(true)
    void adapter
      .fetchRecent(roomId, ROOM_CHAT_FETCH_LIMIT)
      .then((data) => {
        if (!cancelled) setMessages(sortMessagesAsc(data))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = adapter.subscribe(roomId, handleIncoming)

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [roomId, enabled, handleIncoming])

  useEffect(() => {
    if (panelOpen) setUnreadCount(0)
  }, [panelOpen])

  const sendMessage = useCallback(
    async (raw: string) => {
      if (!roomId) return false
      const content = trimChatContent(raw)
      if (!isValidChatContent(content)) return false

      setSending(true)
      try {
        const msg = await adapterRef.current.send(roomId, content)
        setMessages((prev) => appendMessageIfNew(prev, msg))
        return true
      } catch (err) {
        console.error('[useRoomChat] send', err)
        return false
      } finally {
        setSending(false)
      }
    },
    [roomId],
  )

  return {
    messages,
    loading,
    sending,
    unreadCount,
    currentUserId,
    sendMessage,
  }
}
