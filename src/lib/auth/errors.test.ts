import { AuthError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { mapAuthError, validateSignInInput, validateSignUpInput } from './errors'

describe('mapAuthError', () => {
  it('maps user_already_exists', () => {
    const err = new AuthError('User already registered', 400, 'user_already_exists')
    expect(mapAuthError(err)).toBe('E-mail já cadastrado.')
  })

  it('maps invalid_credentials', () => {
    const err = new AuthError('Invalid login credentials', 400, 'invalid_credentials')
    expect(mapAuthError(err)).toBe('E-mail ou senha inválidos.')
  })

  it('maps weak_password', () => {
    const err = new AuthError('Password should be at least 8 characters', 422, 'weak_password')
    expect(mapAuthError(err)).toBe('Senha muito fraca. Use pelo menos 8 caracteres.')
  })

  it('maps email_address_invalid', () => {
    const err = new AuthError('Invalid email', 400, 'email_address_invalid')
    expect(mapAuthError(err)).toBe('Formato de e-mail inválido.')
  })
})

describe('validateSignUpInput', () => {
  it('rejects short password', () => {
    expect(
      validateSignUpInput({
        email: 'a@b.com',
        password: '1234567',
        username: 'vitor',
      }),
    ).toContain('8 caracteres')
  })

  it('rejects short username', () => {
    expect(
      validateSignUpInput({
        email: 'a@b.com',
        password: '12345678',
        username: 'a',
      }),
    ).toContain('usuário')
  })

  it('accepts valid input', () => {
    expect(
      validateSignUpInput({
        email: 'a@b.com',
        password: '12345678',
        username: 'vitor',
      }),
    ).toBeNull()
  })
})

describe('validateSignInInput', () => {
  it('requires password', () => {
    expect(validateSignInInput({ email: 'a@b.com', password: '' })).toContain('senha')
  })
})
