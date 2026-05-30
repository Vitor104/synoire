import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { PartnershipsResult } from './types'

export type ProfileLookup = {
  id: string
  username: string
  avatarUrl: string | null
}

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@/, '')
}

export async function findProfileByUsername(
  username: string,
): Promise<PartnershipsResult<ProfileLookup>> {
  const normalized = normalizeUsername(username)
  if (normalized.length < 2) {
    return { ok: false, message: 'Username inválido.' }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', normalized)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[studyPartners findProfileByUsername]', error)
    return { ok: false, message: 'Não foi possível buscar o estudante.' }
  }

  if (!data) {
    return { ok: false, message: 'Estudante não encontrado.' }
  }

  return {
    ok: true,
    data: {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url,
    },
  }
}
