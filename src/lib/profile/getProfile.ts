import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mapProfileRow, type ProfileRow, type ProfileView } from './types'

export type GetProfileResult =
  | { ok: true; profile: ProfileView }
  | { ok: false; message: string }

function mapQueryError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para ver o perfil.'
  }
  return 'Não foi possível carregar o perfil. Tente novamente.'
}

export async function getProfile(userId: string): Promise<GetProfileResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[profile getProfile]', error)
    return { ok: false, message: mapQueryError(error.message) }
  }

  if (!data) {
    return { ok: false, message: 'Perfil não encontrado.' }
  }

  return { ok: true, profile: mapProfileRow(data as ProfileRow) }
}
