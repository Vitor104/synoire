import { formatMessageTime, type RoomChatMessage } from '@/lib/roomChat'

type RoomChatMessageLineProps = {
  message: RoomChatMessage
  isOwn?: boolean
}

export function RoomChatMessageLine({
  message,
  isOwn = false,
}: RoomChatMessageLineProps) {
  const time = formatMessageTime(message.created_at)
  const username = message.author.username

  return (
    <p className="text-sm leading-relaxed">
      <span className="text-secondary/80">[{time}]</span>{' '}
      <span
        className={isOwn ? 'text-firefly' : 'text-aqua'}
        title={username}
      >
        {username}:
      </span>{' '}
      <span className="text-secondary">{message.content}</span>
    </p>
  )
}
