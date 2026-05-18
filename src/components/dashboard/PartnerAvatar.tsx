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
}: {
  partner: Pick<StudyPartnerView, 'displayName' | 'avatarUrl'>
  className?: string
}) {
  if (partner.avatarUrl) {
    return (
      <img
        src={partner.avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-night/80 text-xs font-medium text-secondary ${className}`}
      aria-hidden
    >
      {initials(partner.displayName)}
    </span>
  )
}
