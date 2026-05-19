import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from './demo'
import { mapPartnershipsQueryError } from './errors'
import type { PartnershipDbStatus, PartnershipRow, PartnershipsResult } from './types'

export async function updatePartnershipStatus(
  partnershipId: string,
  status: Extract<PartnershipDbStatus, 'accepted' | 'rejected'>,
): Promise<PartnershipsResult<PartnershipRow | null>> {
  if (isDemoMode) {
    return { ok: true, data: null }
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('partnerships')
    .update({ status })
    .eq('id', partnershipId)
    .select()
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error('[studyPartners updatePartnershipStatus]', error)
    return { ok: false, message: mapPartnershipsQueryError(error.message) }
  }

  if (!data) {
    return { ok: false, message: 'Não foi possível atualizar o convite.' }
  }

  return { ok: true, data: data as PartnershipRow }
}
