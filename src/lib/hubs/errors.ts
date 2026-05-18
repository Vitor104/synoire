const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export function mapHubQueryError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para continuar.'
  }
  if (
    lower.includes('duplicate') ||
    lower.includes('unique') ||
    lower.includes('23505')
  ) {
    return 'Este hub já está na sua lista.'
  }
  if (lower.includes('slug') && lower.includes('unique')) {
    return 'Já existe um hub com esse identificador. Tente outro nome.'
  }
  return GENERIC_MESSAGE
}

export function isForbiddenError(error: { message?: string; code?: string }): boolean {
  const code = error.code ?? ''
  const lower = (error.message ?? '').toLowerCase()
  return (
    code === '42501' ||
    lower.includes('permission denied') ||
    lower.includes('row-level security') ||
    lower.includes('403')
  )
}

export function isDuplicateUserHubError(error: {
  message?: string
  code?: string
}): boolean {
  const lower = (error.message ?? '').toLowerCase()
  return (
    error.code === '23505' ||
    lower.includes('duplicate') ||
    lower.includes('unique constraint')
  )
}
