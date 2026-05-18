import type { ExternalEmbed } from '@/hooks/useRoomSoundscape'

type RoomMediaEmbedProps = {
  embed: ExternalEmbed | null
  isPlaying: boolean
}

export function RoomMediaEmbed({ embed, isPlaying }: RoomMediaEmbedProps) {
  if (!embed || !isPlaying) return null

  return (
    <iframe
      key={embed.embedSrc}
      src={embed.embedSrc}
      title={embed.label}
      className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
      allow="autoplay; encrypted-media"
      aria-hidden
      tabIndex={-1}
    />
  )
}
