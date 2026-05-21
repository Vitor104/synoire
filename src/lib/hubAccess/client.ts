import { isDemoMode } from '@/lib/hubs/demo'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  grantHubAccessSupabase,
  listHubAccessSupabase,
} from './supabaseHubAccess'
import {
  grantHubAccessLocal,
  listGrantsForHub,
} from './storage'
import type { HubAccessGrant, HubAccessResult } from './types'

function useSupabase(): boolean {
  return isSupabaseConfigured && !isDemoMode
}

export async function grantHubAccess(
  hubId: string,
  userId: string,
): Promise<HubAccessResult<HubAccessGrant>> {
  if (useSupabase()) {
    return grantHubAccessSupabase(hubId, userId)
  }
  const existing = listGrantsForHub(hubId).find((g) => g.userId === userId)
  if (existing) {
    return { ok: true, data: existing, alreadyGranted: true }
  }
  const grant = grantHubAccessLocal(hubId, userId)
  return { ok: true, data: grant }
}

export async function listHubAccess(
  hubId: string,
): Promise<HubAccessResult<HubAccessGrant[]>> {
  if (useSupabase()) {
    return listHubAccessSupabase(hubId)
  }
  return { ok: true, data: listGrantsForHub(hubId) }
}
