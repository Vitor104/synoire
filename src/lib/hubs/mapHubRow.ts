import type { HubRow, HubView } from './types'

const ACCENT_PALETTE: Pick<HubView, 'accentStripe' | 'accentBadge' | 'shortLabel'>[] = [
  {
    shortLabel: 'PF',
    accentStripe: 'bg-firefly shadow-[0_0_16px_rgba(163,163,79,0.3)]',
    accentBadge: 'border-firefly/40 bg-firefly/10 text-firefly',
  },
  {
    shortLabel: 'BB',
    accentStripe: 'bg-aqua shadow-[0_0_16px_rgba(103,199,255,0.28)]',
    accentBadge: 'border-aqua/45 bg-aqua/10 text-aqua',
  },
  {
    shortLabel: 'INSS',
    accentStripe: 'bg-primary/35',
    accentBadge: 'border-border bg-elevated text-primary',
  },
  {
    shortLabel: 'TRT',
    accentStripe: 'bg-[#60a5fa] shadow-[0_0_14px_rgba(96,165,250,0.35)]',
    accentBadge: 'border-[#60a5fa]/45 bg-[#60a5fa]/12 text-[#93c5fd]',
  },
  {
    shortLabel: 'RFB',
    accentStripe: 'bg-firefly shadow-[0_0_16px_rgba(163,163,79,0.3)]',
    accentBadge: 'border-firefly/40 bg-firefly/10 text-firefly',
  },
]

const PRIVATE_ACCENT = {
  shortLabel: 'Privado',
  accentStripe: 'bg-firefly shadow-[0_0_16px_rgba(163,163,79,0.3)]',
  accentBadge: 'border-firefly/40 bg-firefly/10 text-firefly',
} as const

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function deriveShortLabel(name: string, slug: string): string {
  if (slug.length <= 4 && /^[a-z0-9-]+$/.test(slug)) {
    return slug.toUpperCase().replace(/-/g, '')
  }
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 6)
  }
  return name.trim().slice(0, 6).toUpperCase() || 'HUB'
}

export function mapHubRow(row: HubRow): HubView {
  const isPrivate = Boolean(row.is_private)
  const palette = isPrivate
    ? PRIVATE_ACCENT
    : ACCENT_PALETTE[hashSlug(row.slug) % ACCENT_PALETTE.length]

  return {
    id: row.id,
    slug: row.slug,
    name: row.name.trim(),
    shortLabel: isPrivate ? PRIVATE_ACCENT.shortLabel : deriveShortLabel(row.name, row.slug),
    accentStripe: palette.accentStripe,
    accentBadge: palette.accentBadge,
    isPrivate: isPrivate || undefined,
    iconEmoji: row.icon_emoji?.trim() || undefined,
    creatorId: row.creator_id ?? null,
  }
}
