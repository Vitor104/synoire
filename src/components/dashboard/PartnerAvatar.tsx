import type { StudyPartnerView } from '@/lib/studyPartners'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return (name.slice(0, 2) || '?').toUpperCase()
}

export function PartnerAvatar({
  partner,
  className = 'h-9 w-9',
  showPresenceIndicator = false,
  presenceIndicator,
}: {
  partner: Pick<StudyPartnerView, 'displayName' | 'avatarUrl'>
  className?: string
  /** @deprecated Prefer presenceIndicator */
  showPresenceIndicator?: boolean
  presenceIndicator?: 'focando' | 'online'
}) {
  const indicatorKind =
    presenceIndicator ?? (showPresenceIndicator ? 'focando' : undefined)
  const indicator = indicatorKind ? (
    <span
      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-panel ${
        indicatorKind === 'online' ? 'bg-emerald-400' : 'bg-firefly'
      }`}
      aria-hidden
    />
  ) : null

  if (partner.avatarUrl) {
    return (
      <span className="relative shrink-0">
        <img
          src={partner.avatarUrl}
          alt=""
          className={`rounded-full object-cover ${className}`}
        />
        {indicator}
      </span>
    )
  }

  return (
    <span className="relative shrink-0">
      <span
        className={`flex items-center justify-center rounded-full border border-white/10 bg-night/80 text-xs font-medium text-secondary ${className}`}
        aria-hidden
      >
        {initials(partner.displayName)}
      </span>
      {indicator}
    </span>
  )
}
