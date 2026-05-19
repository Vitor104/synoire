import { buildPartnerLists } from './buildPartnerViews'
import { fetchPartnerEnrichment } from './fetchPartnerEnrichment'
import { listPartnerships } from './listPartnerships'
import type { PartnerLists, PartnershipsResult } from './types'

export async function loadPartnerLists(
  userId: string,
): Promise<PartnershipsResult<PartnerLists>> {
  const partnershipsResult = await listPartnerships(userId)
  if (!partnershipsResult.ok) {
    return { ok: false, message: partnershipsResult.message }
  }

  const partnerships = partnershipsResult.data
  const partnerIds = partnerships.map((p) => p.partnerUserId)
  const enrichment = await fetchPartnerEnrichment(partnerIds)

  return {
    ok: true,
    data: buildPartnerLists(partnerships, enrichment),
  }
}
