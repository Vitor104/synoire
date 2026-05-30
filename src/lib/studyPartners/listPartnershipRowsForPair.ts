import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { getPartnerUserId } from './mapPartnershipRow'
import type { PartnershipRow } from './types'

/** Rows between two users (any status), for re-invite cleanup after rejection. */
export async function listPartnershipRowsForPair(
  userId: string,
  partnerUserId: string,
): Promise<PartnershipRow[]> {
  if (!isSupabaseConfigured) return []

  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

  if (error) {
    if (import.meta.env.DEV) console.error('[studyPartners listPartnershipRowsForPair]', error)
    return []
  }

  const rows = (data as PartnershipRow[] | null) ?? []
  return rows.filter((row) => getPartnerUserId(row, userId) === partnerUserId)
}
