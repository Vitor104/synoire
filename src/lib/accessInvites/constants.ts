export const ACCESS_INVITE_COOLDOWN_MS = 24 * 60 * 60 * 1000

export type AccessInviteGrantFields = {
  grantedAt: string
  acceptedAt?: string | null
}

/** Invite still blocks re-send from the inviter (within cooldown, not accepted). */
export function isAccessInvitePending(
  grantedAt: string,
  acceptedAt?: string | null,
): boolean {
  if (acceptedAt) return false
  const grantedMs = new Date(grantedAt).getTime()
  if (!Number.isFinite(grantedMs)) return false
  return Date.now() - grantedMs < ACCESS_INVITE_COOLDOWN_MS
}

/** Grant still grants join access (accepted or within cooldown). */
export function isAccessGrantActive(
  grantedAt: string,
  acceptedAt?: string | null,
): boolean {
  if (acceptedAt) return true
  const grantedMs = new Date(grantedAt).getTime()
  if (!Number.isFinite(grantedMs)) return false
  return Date.now() - grantedMs < ACCESS_INVITE_COOLDOWN_MS
}

export function filterPendingGrantsForInviter<T extends AccessInviteGrantFields>(
  grants: T[],
): T[] {
  return grants.filter((g) => isAccessInvitePending(g.grantedAt, g.acceptedAt))
}

export function getRoomInviterButtonState(grant?: AccessInviteGrantFields | null): {
  disabled: boolean
  label: string
} {
  if (!grant) {
    return { disabled: false, label: 'Enviar Convite' }
  }
  if (grant.acceptedAt) {
    return { disabled: true, label: 'Aceito' }
  }
  if (isAccessInvitePending(grant.grantedAt, grant.acceptedAt)) {
    return { disabled: true, label: 'Enviado' }
  }
  return { disabled: false, label: 'Reenviar convite' }
}

export function getHubInviterButtonState(grant?: { grantedAt: string } | null): {
  disabled: boolean
  label: string
} {
  if (!grant) {
    return { disabled: false, label: 'Convidar para o Hub' }
  }
  if (isAccessInvitePending(grant.grantedAt)) {
    return { disabled: true, label: 'Convidado' }
  }
  return { disabled: false, label: 'Convidar para o Hub' }
}
