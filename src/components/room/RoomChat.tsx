import { AnimatePresence, motion } from 'motion/react'
import type { RoomChatMessage } from '@/lib/roomChat'
import { RoomChatInput } from './RoomChatInput'
import { RoomChatMessageList } from './RoomChatMessageList'

export type RoomChatPanelProps = {
  open: boolean
  onClose: () => void
  canSendMessage: boolean
  prefersReducedMotion?: boolean
  messages: RoomChatMessage[]
  loading: boolean
  sending: boolean
  currentUserId: string
  onSend: (text: string) => Promise<boolean>
}

export function RoomChat({
  open,
  onClose,
  canSendMessage,
  prefersReducedMotion = false,
  messages,
  loading,
  sending,
  currentUserId,
  onSend,
}: RoomChatPanelProps) {
  const slide = prefersReducedMotion
    ? { initial: false, animate: { x: 0 }, exit: { x: 0 } }
    : {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
      }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="Chat da sala"
          aria-modal="false"
          className="pointer-events-auto fixed bottom-0 right-0 top-0 z-40 flex w-[min(100%,20rem)] flex-col border-l border-border bg-surface/95 backdrop-blur-sm"
          {...slide}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.42, 0, 0.58, 1] }}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-primary">Sussurros</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-xs text-secondary hover:bg-elevated hover:text-primary"
              aria-label="Fechar chat"
            >
              Fechar
            </button>
          </header>

          <RoomChatMessageList
            messages={messages}
            loading={loading}
            currentUserId={currentUserId}
          />

          <RoomChatInput
            canSend={canSendMessage}
            sending={sending}
            onSend={onSend}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

type RoomChatToggleButtonProps = {
  open: boolean
  unreadCount: number
  onClick: () => void
  className?: string
}

export function RoomChatToggleButton({
  open,
  unreadCount,
  onClick,
  className = '',
}: RoomChatToggleButtonProps) {
  const hasUnread = unreadCount > 0 && !open

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-lg px-3 py-2 text-sm transition-colors hover:bg-elevated hover:text-primary ${
        hasUnread
          ? 'text-aqua ring-1 ring-firefly-dim'
          : 'text-secondary'
      } ${className}`}
      aria-expanded={open}
      aria-label={
        hasUnread
          ? `Chat da sala, ${unreadCount} mensagens não lidas`
          : 'Chat da sala'
      }
    >
      <span className="flex items-center gap-1.5">
        <ChatBubbleIcon />
        Chat
      </span>
      {hasUnread && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-aqua px-1 text-[10px] font-medium text-night">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
