import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isForbiddenError, mapHubQueryError } from './errors'
import { mapHubRow } from './mapHubRow'
import { buildUniqueHubSlug } from './slugify'
import type { HubView, HubsResult } from './types'

export type CreatePrivateHubInput = {
  name: string
  creatorId: string
  existingSlugs?: string[]
  iconEmoji?: string
}

export async function createPrivateHub(
  input: CreatePrivateHubInput,
): Promise<HubsResult<HubView>> {
  const name = input.name.trim()
  const existingSlugs = input.existingSlugs ?? []

  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não configurado.' }
  }

  const slug = buildUniqueHubSlug(name, existingSlugs)

  const { data, error } = await supabase
    .from('hubs')
    .insert({
      name,
      slug,
      is_private: true,
      creator_id: input.creatorId,
    })
    .select()
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('[hubs createPrivateHub]', error)
    if (isForbiddenError(error)) {
      return {
        ok: false,
        message: 'Hubs privados são exclusivos do plano Glow.',
        code: 'forbidden',
      }
    }
    return { ok: false, message: mapHubQueryError(error.message) }
  }

  const view = mapHubRow(data)
  if (input.iconEmoji) {
    view.iconEmoji = input.iconEmoji
  }
  return { ok: true, data: view }
}
