const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export function mapPartnershipsQueryError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para continuar.'
  }
  return GENERIC_MESSAGE
}

export function isDuplicatePartnershipError(error: {
  message?: string
  code?: string
}): boolean {
  const code = error.code ?? ''
  const lower = (error.message ?? '').toLowerCase()
  return (
    code === '23505' ||
    lower.includes('duplicate') ||
    lower.includes('unique constraint')
  )
}
