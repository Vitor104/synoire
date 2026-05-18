import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { HubRequestRow } from './types'
import { validateRequestName } from './validateRequestName'

function mapInsertError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('hub_requests_name_length')) {
    return 'O nome deve ter entre 2 e 120 caracteres.'
  }
  if (lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Entre na sua conta para enviar uma sugestão.'
  }
  return 'Não foi possível enviar a sugestão. Tente novamente.'
}

export async function submitHubRequest(
  userId: string,
  requestedName: string,
): Promise<HubRequestRow> {
  if (!userId) {
    throw new Error('Entre na sua conta para enviar uma sugestão.')
  }

  const validation = validateRequestName(requestedName)
  if (!validation.ok) {
    throw new Error(validation.error)
  }

  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado.')
  }

  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase não configurado.')
  }

  const { data, error } = await supabase
    .from('hub_requests')
    .insert({
      user_id: userId,
      requested_name: validation.value,
    })
    .select()
    .single()

  if (error) {
    throw new Error(mapInsertError(error.message))
  }

  if (!data) {
    throw new Error('Não foi possível enviar a sugestão. Tente novamente.')
  }

  return data as HubRequestRow
}
