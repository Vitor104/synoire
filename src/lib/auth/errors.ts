import { AuthError } from '@supabase/supabase-js'
import { MIN_PASSWORD_LENGTH, WEAK_PASSWORD_MESSAGE } from './constants'

const GENERIC_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export function mapAuthError(error: unknown): string {
  if (!(error instanceof AuthError)) {
    if (error instanceof Error && error.message) {
      return mapMessage(error.message) ?? GENERIC_MESSAGE
    }
    return GENERIC_MESSAGE
  }

  const code = error.code ?? ''
  const msg = error.message.toLowerCase()

  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return 'E-mail já cadastrado.'
  }
  if (code === 'weak_password' || msg.includes('password')) {
    return WEAK_PASSWORD_MESSAGE
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login')) {
    return 'E-mail ou senha inválidos.'
  }
  if (code === 'email_address_invalid' || msg.includes('invalid email')) {
    return 'Formato de e-mail inválido.'
  }

  return mapMessage(error.message) ?? GENERIC_MESSAGE
}

function mapMessage(message: string): string | null {
  const lower = message.toLowerCase()
  if (lower.includes('already registered')) return 'E-mail já cadastrado.'
  if (lower.includes('invalid login')) return 'E-mail ou senha inválidos.'
  if (lower.includes('invalid email')) return 'Formato de e-mail inválido.'
  if (lower.includes('password')) return WEAK_PASSWORD_MESSAGE
  return null
}

export function validateSignUpInput(input: {
  email: string
  password: string
  username: string
}): string | null {
  const email = input.email.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Informe um e-mail válido.'
  }
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return WEAK_PASSWORD_MESSAGE
  }
  const username = input.username.trim()
  if (username.length < 2 || username.length > 32) {
    return 'Nome de usuário deve ter entre 2 e 32 caracteres.'
  }
  return null
}

export function validateSignInInput(input: {
  email: string
  password: string
}): string | null {
  const email = input.email.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Informe um e-mail válido.'
  }
  if (!input.password) {
    return 'Informe sua senha.'
  }
  return null
}
