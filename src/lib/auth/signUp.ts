import { getSupabase } from '@/lib/supabase'
import { mapAuthError } from './errors'

export type SignUpInput = {
  email: string
  password: string
  username: string
  avatarUrl?: string | null
}

export type SignUpResult =
  | { ok: true; needsEmailConfirmation: false }
  | { ok: true; needsEmailConfirmation: true }
  | { ok: false; message: string }

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const avatarUrl = input.avatarUrl?.trim() || null

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        username: input.username.trim(),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      },
    },
  })

  if (error) {
    if (import.meta.env.DEV) console.error('[auth signUp]', error)
    return { ok: false, message: mapAuthError(error) }
  }

  if (!data.session) {
    return { ok: true, needsEmailConfirmation: true }
  }

  if (avatarUrl && data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', data.user.id)

    if (profileError && import.meta.env.DEV) {
      console.error('[auth signUp] profile avatar update', profileError)
    }
  }

  return { ok: true, needsEmailConfirmation: false }
}
