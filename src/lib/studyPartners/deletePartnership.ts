import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from './demo'
import { mapPartnershipsQueryError } from './errors'
import type { PartnershipsResult } from './types'

export async function deletePartnership(
  partnershipId: string,
): Promise<PartnershipsResult<void>> {
  if (isDemoMode) {
    return { ok: true, data: undefined }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { error } = await supabase.from('partnerships').delete().eq('id', partnershipId)

  if (error) {
    if (import.meta.env.DEV) console.error('[studyPartners deletePartnership]', error)
    return { ok: false, message: mapPartnershipsQueryError(error.message) }
  }

  return { ok: true, data: undefined }
}
