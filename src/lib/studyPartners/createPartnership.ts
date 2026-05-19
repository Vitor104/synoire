import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from './demo'
import { isDuplicatePartnershipError, mapPartnershipsQueryError } from './errors'
import type { PartnershipRow, PartnershipsResult } from './types'

export async function createPartnership(
  senderId: string,
  receiverId: string,
): Promise<PartnershipsResult<PartnershipRow>> {
  if (isDemoMode) {
    return {
      ok: true,
      data: {
        id: `demo-ps-${crypto.randomUUID()}`,
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    }
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
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
    })
    .select()
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[studyPartners createPartnership]', error)
    if (isDuplicatePartnershipError(error)) {
      return { ok: false, message: 'Já existe convite ou parceria com este usuário.' }
    }
    return { ok: false, message: mapPartnershipsQueryError(error.message) }
  }

  if (!data) {
    return { ok: false, message: 'Não foi possível enviar o convite. Tente novamente.' }
  }

  return { ok: true, data: data as PartnershipRow }
}
