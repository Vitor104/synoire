import { getSupabase } from '@/lib/supabase'
import { mapAuthError } from './errors'

export type SignInInput = {
  email: string
  password: string
}

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string }

export async function signIn(input: SignInInput): Promise<SignInResult> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[auth signIn]', error)
    return { ok: false, message: mapAuthError(error) }
  }

  return { ok: true }
}
