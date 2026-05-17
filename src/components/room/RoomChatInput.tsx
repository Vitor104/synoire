import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { ROOM_CHAT_MAX_LENGTH } from '@/lib/roomChat'

type RoomChatInputProps = {
  canSend: boolean
  sending?: boolean
  onSend: (text: string) => Promise<boolean>
}

export function RoomChatInput({
  canSend,
  sending = false,
  onSend,
}: RoomChatInputProps) {
  const [text, setText] = useState('')

  const submit = async () => {
    if (!canSend || sending || !text.trim()) return
    const ok = await onSend(text)
    if (ok) setText('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submit()
    }
  }

  const placeholder = canSend
    ? 'Sussurre algo para a sala...'
    : 'Chat liberado na pausa'

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 border-t border-white/10 px-4 py-3"
    >
      <label className="sr-only" htmlFor="room-chat-input">
        Mensagem para a sala
      </label>
      <textarea
        id="room-chat-input"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, ROOM_CHAT_MAX_LENGTH))}
        onKeyDown={onKeyDown}
        disabled={!canSend || sending}
        aria-disabled={!canSend || sending}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-secondary/50 focus:border-aqua/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </form>
  )
}
