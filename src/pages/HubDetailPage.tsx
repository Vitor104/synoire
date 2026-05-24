import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CreateRoomModal } from '@/components/hub/CreateRoomModal'
import { InviteToHubModal } from '@/components/hub/InviteToHubModal'
import { HubRoomList } from '@/components/hub/HubRoomList'
import { LockIcon } from '@/components/premium/LockIcon'
import { AppToast } from '@/components/ui/AppToast'
import { useAuth } from '@/contexts/AuthContext'
import { useJoinedHubs } from '@/contexts/JoinedHubsContext'
import { useStudyPartners } from '@/contexts/StudyPartnersContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useHubEntry } from '@/hooks/useHubEntry'
import { useHubRooms } from '@/hooks/useHubRooms'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { getOrCreateHubInviteToken } from '@/lib/hubAccess'
import { copyHubInviteUrl } from '@/lib/hubs/hubInviteUrl'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

export function HubDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)

  const { user } = useAuth()
  const { refreshJoined } = useJoinedHubs()
  const { acceptedPartners } = useStudyPartners()
  const { openPaywall } = useUserPlan()
  const { hub, entryStatus, entryMessage, hubLoading } = useHubEntry(slug)
  const { rooms, isLoading, error, createRoom } = useHubRooms(
    entryStatus === 'ready' ? slug : undefined,
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [inviteHubOpen, setInviteHubOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [toast, setToast] = useState({ message: '', visible: false })

  const canShareHub = Boolean(
    hub && (!hub.isPrivate || (user?.id && hub.creatorId && user.id === hub.creatorId)),
  )
  const isHubOwner = Boolean(
    hub?.isPrivate && user?.id && hub.creatorId && user.id === hub.creatorId,
  )

  useEffect(() => {
    if (entryStatus === 'ready' && searchParams.get('invite')) {
      void refreshJoined()
    }
  }, [entryStatus, refreshJoined, searchParams])

  const handleCopyHubLink = useCallback(async () => {
    if (!hub || !slug) return

    if (hub.isPrivate) {
      if (!user?.id) return
      const tokenResult = await getOrCreateHubInviteToken(hub.id, user.id)
      if (!tokenResult.ok) {
        setToast({ message: tokenResult.message, visible: true })
        return
      }
      const ok = await copyHubInviteUrl(slug, tokenResult.data)
      setToast({
        message: ok
          ? 'Link de convite copiado!'
          : 'Não foi possível copiar o link. Tente novamente.',
        visible: true,
      })
      return
    }

    const ok = await copyHubInviteUrl(slug)
    setToast({
      message: ok ? 'Link do hub copiado!' : 'Não foi possível copiar o link. Tente novamente.',
      visible: true,
    })
  }, [hub, slug, user?.id])

  if (hubLoading && !hub) {
    return (
      <motion.div
        className="mx-auto max-w-lg py-16 text-center"
        variants={c}
        initial={reduced ? false : 'hidden'}
        animate="visible"
      >
        <motion.p variants={item} className="text-secondary">
          Carregando hub…
        </motion.p>
      </motion.div>
    )
  }

  if (!hubLoading && entryStatus === 'not_found') {
    return (
      <motion.div
        className="mx-auto max-w-lg py-16 text-center"
        variants={c}
        initial={reduced ? false : 'hidden'}
        animate="visible"
      >
        <motion.p variants={item} className="text-secondary">
          Hub não encontrado.
        </motion.p>
        <motion.div variants={item}>
          <Link to="/hubs" className="mt-4 inline-block text-sm text-aqua">
            Voltar aos hubs
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  if (entryStatus !== 'ready' || !hub) {
    const title =
      entryStatus === 'invalid_invite' || entryStatus === 'denied_private'
        ? hub?.name || 'Hub privado'
        : hub?.name ?? 'Hub'
    const subtitle =
      entryMessage ??
      (entryStatus === 'loading'
        ? 'Verificando acesso…'
        : entryStatus === 'error'
          ? 'Tente novamente em instantes.'
          : '')

    return (
      <motion.div
        className="mx-auto max-w-lg py-16 text-center"
        variants={c}
        initial={reduced ? false : 'hidden'}
        animate="visible"
      >
        <motion.h1 variants={item} className="text-xl font-semibold text-primary">
          {title}
        </motion.h1>
        {hub?.isPrivate && (
          <motion.p variants={item} className="mt-2 text-sm text-firefly">
            Hub privado
          </motion.p>
        )}
        {subtitle && (
          <motion.p variants={item} className="mt-3 text-sm text-secondary">
            {subtitle}
          </motion.p>
        )}
        <motion.div variants={item}>
          <Link to="/hubs" className="mt-8 inline-block text-sm text-aqua">
            Voltar aos hubs
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  const handleCreate = async (
    theme: string,
    focusCycle: Parameters<typeof createRoom>[1],
    isPrivate: boolean,
  ) => {
    setIsSubmitting(true)
    setCreateError(null)
    try {
      const result = await createRoom(theme, focusCycle, isPrivate)
      if (!result.ok) {
        if (result.code === 'forbidden') {
          openPaywall()
          setCreateOpen(false)
          return
        }
        setCreateError(result.message)
        return
      }
      navigate(`/salas/${result.room.id}`, { state: { sessionStart: 'lounge' } })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      key={slug}
      className="mx-auto max-w-3xl"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.div variants={item}>
        <Link
          to="/hubs"
          className="text-sm text-secondary hover:text-primary"
        >
          ← Hubs
        </Link>
      </motion.div>
      <motion.header variants={item} className="mt-6">
        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <motion.div variants={item} className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-primary">{hub.name}</h1>
            {hub.isPrivate && (
              <span className="rounded-md border border-firefly/40 bg-firefly/10 px-2 py-0.5 text-xs font-semibold text-firefly">
                Hub Privado
              </span>
            )}
          </motion.div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {canShareHub && (
              <button
                type="button"
                onClick={() => void handleCopyHubLink()}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-firefly hover:bg-elevated"
              >
                {hub.isPrivate && (
                  <LockIcon className="h-3.5 w-3.5 opacity-80" aria-hidden />
                )}
                Copiar link
              </button>
            )}
            {isHubOwner && (
              <button
                type="button"
                onClick={() => setInviteHubOpen(true)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-firefly hover:bg-elevated"
              >
                Convidar Membros
              </button>
            )}
          </div>
        </motion.div>
        <p className="mt-2 text-sm text-secondary">
          Salas de foco criadas por estudantes neste hub. Salas vazias por mais
          de 24 horas somem da lista.
        </p>
      </motion.header>

      {error && (
        <motion.p variants={item} className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </motion.p>
      )}

      <HubRoomList
        rooms={rooms}
        isLoading={isLoading}
        hubName={hub.name}
        onOpenCreate={() => setCreateOpen(true)}
        prefersReducedMotion={reduced}
      />

      {createError && (
        <motion.p variants={item} className="mt-4 text-sm text-red-400" role="alert">
          {createError}
        </motion.p>
      )}

      <CreateRoomModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          setCreateError(null)
        }}
        onCreate={handleCreate}
        prefersReducedMotion={reduced}
        isSubmitting={isSubmitting}
      />

      {isHubOwner && (
        <InviteToHubModal
          open={inviteHubOpen}
          onClose={() => setInviteHubOpen(false)}
          hubId={hub.id}
          hubSlug={hub.slug}
          creatorId={user!.id}
          partners={acceptedPartners}
          prefersReducedMotion={reduced}
        />
      )}

      <AppToast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </motion.div>
  )
}
