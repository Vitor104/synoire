const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export function mapStudySessionsQueryError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para continuar.'
  }
  return GENERIC_MESSAGE
}

export function mapStudySessionsCreateError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para registrar a sessão.'
  }
  if (
    lower.includes('duration_minutes') ||
    lower.includes('room_id') ||
    lower.includes('check constraint')
  ) {
    return 'Não foi possível registrar a sessão. Tente novamente.'
  }
  return GENERIC_MESSAGE
}
