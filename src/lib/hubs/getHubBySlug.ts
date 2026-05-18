import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { getDemoHubBySlug, isDemoMode } from './demo'
import { mapHubQueryError } from './errors'
import { mapHubRow } from './mapHubRow'
import type { HubRow, HubView, HubsResult } from './types'

export async function getHubBySlug(
  slug: string,
): Promise<HubsResult<HubView | null>> {
  if (!slug.trim()) {
    return { ok: true, data: null }
  }

  if (isDemoMode) {
    return { ok: true, data: getDemoHubBySlug(slug) ?? null }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('hubs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[hubs getHubBySlug]', error)
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  if (!data) {
    return { ok: true, data: null }
  }

  return { ok: true, data: mapHubRow(data as HubRow) }
}
