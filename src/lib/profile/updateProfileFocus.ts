import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { MAX_BIO_LENGTH } from './constants'
import { mapProfileRow, type ProfileRow, type ProfileView } from './types'

export type UpdateProfileFocusInput = {
  targetExam: string
  bio: string
}

export type UpdateProfileFocusResult =
  | { ok: true; profile: ProfileView }
  | { ok: false; message: string }

function validateFocusInput(input: UpdateProfileFocusInput): string | null {
  const target = input.targetExam.trim()
  if (!target) {
    return 'Informe o concurso-alvo.'
  }
  if (target.length > 120) {
    return 'O concurso-alvo deve ter no máximo 120 caracteres.'
  }
  const bio = input.bio.trim()
  if (bio.length > MAX_BIO_LENGTH) {
    return `A bio deve ter no máximo ${MAX_BIO_LENGTH} caracteres.`
  }
  return null
}

function mapUpdateError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para atualizar o perfil.'
  }
  return 'Não foi possível atualizar o perfil.'
}

export async function updateProfileFocus(
  userId: string,
  input: UpdateProfileFocusInput,
): Promise<UpdateProfileFocusResult> {
  const validationError = validateFocusInput(input)
  if (validationError) {
    return { ok: false, message: validationError }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const target_exam = input.targetExam.trim()
  const bio = input.bio.trim() || null

  const { data, error } = await supabase
    .from('profiles')
    .update({ target_exam, bio })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[profile updateProfileFocus]', error)
    return { ok: false, message: mapUpdateError(error.message) }
  }

  if (!data) {
    return { ok: false, message: 'Não foi possível atualizar o perfil.' }
  }

  return { ok: true, profile: mapProfileRow(data as ProfileRow) }
}
