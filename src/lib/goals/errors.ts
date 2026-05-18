const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export function mapGoalsQueryError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para continuar.'
  }
  return GENERIC_MESSAGE
}

export function mapGoalsCreateError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para criar uma meta.'
  }
  if (
    lower.includes('subject_name') ||
    lower.includes('target_minutes') ||
    lower.includes('check constraint')
  ) {
    return 'Verifique os dados da meta e tente novamente.'
  }
  return GENERIC_MESSAGE
}

export function isForbiddenGoalsError(error: {
  message?: string
  code?: string
}): boolean {
  const code = error.code ?? ''
  const lower = (error.message ?? '').toLowerCase()
  return (
    code === '42501' ||
    lower.includes('permission denied') ||
    lower.includes('row-level security') ||
    lower.includes('403')
  )
}
