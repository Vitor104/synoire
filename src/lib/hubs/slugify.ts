export function slugifyHubName(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'hub'
  )
}

export function buildUniqueHubSlug(
  name: string,
  existingSlugs: string[],
): string {
  const base = slugifyHubName(name)
  let slug = base
  let suffix = 0
  while (existingSlugs.includes(slug)) {
    suffix += 1
    slug = `${base}-${suffix}`
  }
  return slug
}
