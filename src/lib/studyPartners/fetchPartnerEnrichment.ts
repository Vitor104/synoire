import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from './demo'
import type { PartnerProfileEnrichment } from './types'

export async function fetchPartnerEnrichment(
  partnerUserIds: string[],
): Promise<Map<string, PartnerProfileEnrichment>> {
  const map = new Map<string, PartnerProfileEnrichment>()
  const uniqueIds = [...new Set(partnerUserIds.filter(Boolean))]
  if (uniqueIds.length === 0) return map

  if (isDemoMode || !isSupabaseConfigured) return map

  const supabase = getSupabase()
  if (!supabase) return map

  const [profilesResult, statsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', uniqueIds),
    supabase
      .from('user_stats')
      .select('user_id, current_streak')
      .in('user_id', uniqueIds),
  ])

  if (profilesResult.error && import.meta.env.DEV) {
    console.error('[studyPartners fetchPartnerEnrichment profiles]', profilesResult.error)
  }
  if (statsResult.error && import.meta.env.DEV) {
    console.error('[studyPartners fetchPartnerEnrichment user_stats]', statsResult.error)
  }

  const streakByUser = new Map<string, number>()
  for (const row of statsResult.data ?? []) {
    streakByUser.set(row.user_id, row.current_streak ?? 0)
  }

  for (const profile of profilesResult.data ?? []) {
    const username = profile.username?.trim() || 'estudante'
    map.set(profile.id, {
      id: profile.id,
      username,
      displayName: username,
      avatarUrl: profile.avatar_url?.trim() ?? '',
      currentStreak: streakByUser.get(profile.id) ?? 0,
    })
  }

  return map
}
