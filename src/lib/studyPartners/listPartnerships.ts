import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mapPartnershipsQueryError } from './errors'
import { mapPartnershipRows } from './mapPartnershipRow'
import type { MappedPartnership, PartnershipRow, PartnershipsResult } from './types'

export async function listPartnerships(
  userId: string,
): Promise<PartnershipsResult<MappedPartnership[]>> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

  if (error) {
    if (import.meta.env.DEV) console.error('[studyPartners listPartnerships]', error)
    return { ok: false, message: mapPartnershipsQueryError(error.message) }
  }

  const rows = (data as PartnershipRow[] | null) ?? []
  const mapped = mapPartnershipRows(
    rows.filter((r) => r.status !== 'rejected'),
    userId,
  )

  return { ok: true, data: mapped }
}
