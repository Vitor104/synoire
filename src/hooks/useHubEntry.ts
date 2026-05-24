import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { redeemHubInviteToken } from '@/lib/hubAccess/hubInviteTokens'
import { canJoinHub, type CanJoinHubResult } from '@/lib/hubs/canJoinHub'
import { getHubBySlug } from '@/lib/hubs/getHubBySlug'
import type { HubView } from '@/lib/hubs/types'

export type HubEntryStatus =
  | 'loading'
  | 'ready'
  | 'denied_private'
  | 'invalid_invite'
  | 'not_found'
  | 'error'

export function useHubEntry(slug: string | undefined): {
  hub: HubView | null
  entryStatus: HubEntryStatus
  entryMessage: string | null
  hubLoading: boolean
  refreshEntry: () => void
} {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')?.trim() || null

  const [hub, setHub] = useState<HubView | null>(null)
  const [hubLoading, setHubLoading] = useState(Boolean(slug))
  const [joinResult, setJoinResult] = useState<CanJoinHubResult | null>(null)
  const [joinLoading, setJoinLoading] = useState(Boolean(slug && user?.id))
  const [redeemState, setRedeemState] = useState<'idle' | 'loading' | 'invalid' | 'ok'>('idle')
  const [entryTick, setEntryTick] = useState(0)

  const refreshEntry = () => setEntryTick((n) => n + 1)

  useEffect(() => {
    if (!slug) {
      setHub(null)
      setHubLoading(false)
      return
    }

    let cancelled = false
    setHubLoading(true)

    void getHubBySlug(slug).then((result) => {
      if (cancelled) return
      if (result.ok && result.data) {
        setHub(result.data)
      } else {
        setHub(null)
      }
      setHubLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [slug, entryTick])

  useEffect(() => {
    if (!slug || !user?.id) {
      setJoinResult(null)
      setJoinLoading(false)
      setRedeemState('idle')
      return
    }

    let cancelled = false

    const run = async () => {
      setJoinLoading(true)

      if (inviteToken && hub?.id) {
        setRedeemState('loading')
        const redeem = await redeemHubInviteToken(hub.id, slug, inviteToken, user.id)
        if (cancelled) return
        if (!redeem.ok) {
          setRedeemState('idle')
          setJoinResult({ status: 'error', message: redeem.message })
          setJoinLoading(false)
          return
        }
        if (!redeem.data) {
          setRedeemState('invalid')
        } else {
          setRedeemState('ok')
        }
      } else {
        setRedeemState('idle')
      }

      const result = await canJoinHub(slug, user.id)
      if (!cancelled) {
        setJoinResult(result)
        setJoinLoading(false)
      }
    }

    if (inviteToken && !hub?.id && hubLoading) {
      return
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [slug, user?.id, inviteToken, hub?.id, hubLoading, entryTick])

  const entryStatus = useMemo((): HubEntryStatus => {
    if (!slug) return 'not_found'
    if (hubLoading || joinLoading) return 'loading'

    if (joinResult?.status === 'error') return 'error'
    if (joinResult?.status === 'not_found') return 'not_found'

    if (redeemState === 'invalid') return 'invalid_invite'

    if (joinResult?.status === 'denied_private') return 'denied_private'

    if (joinResult?.status === 'allowed') {
      if (hub) return 'ready'
      return 'not_found'
    }

    return 'not_found'
  }, [slug, hubLoading, joinLoading, joinResult, hub, redeemState])

  const entryMessage = useMemo(() => {
    if (joinResult?.status === 'error') return joinResult.message
    if (entryStatus === 'invalid_invite') {
      return 'Link de convite inválido ou expirado.'
    }
    if (entryStatus === 'denied_private') {
      return 'Este hub é privado. Peça um link de convite ao criador.'
    }
    return null
  }, [joinResult, entryStatus])

  return {
    hub,
    entryStatus,
    entryMessage,
    hubLoading: hubLoading || joinLoading,
    refreshEntry,
  }
}
