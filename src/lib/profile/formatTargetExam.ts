/** Exibe slug legível: policia-federal → Policia federal */
export function formatTargetExamSlug(slug: string | null | undefined): string | null {
  const trimmed = slug?.trim()
  if (!trimmed) return null
  return trimmed
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}
