import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CreateRoomModal } from '@/components/hub/CreateRoomModal'
import { InviteToHubModal } from '@/components/hub/InviteToHubModal'
import { HubRoomList } from '@/components/hub/HubRoomList'
import { useAuth } from '@/contexts/AuthContext'
import { useStudyPartners } from '@/contexts/StudyPartnersContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { useHubRooms } from '@/hooks/useHubRooms'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { getHubBySlug } from '@/lib/hubs'
import type { HubView } from '@/lib/hubs/types'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

export function HubDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [hub, setHub] = useState<HubView | null | undefined>(undefined)
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)

  const { user } = useAuth()
  const { acceptedPartners } = useStudyPartners()
  const { openPaywall } = useUserPlan()
  const { rooms, isLoading, error, createRoom } = useHubRooms(slug)
  const [createOpen, setCreateOpen] = useState(false)
  const [inviteHubOpen, setInviteHubOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setHub(null)
      return
    }
    let cancelled = false
    setHub(undefined)
    void getHubBySlug(slug).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setHub(result.data)
      } else {
        setHub(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (hub === undefined) {
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

  if (!hub) {
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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-primary">{hub.name}</h1>
            {hub.isPrivate && (
              <span className="rounded-md border border-firefly/40 bg-firefly/10 px-2 py-0.5 text-xs font-semibold text-firefly">
                Hub Privado
              </span>
            )}
          </div>
          {hub.isPrivate &&
            user?.id &&
            hub.creatorId &&
            user.id === hub.creatorId && (
              <button
                type="button"
                onClick={() => setInviteHubOpen(true)}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-firefly hover:bg-elevated"
              >
                Convidar Membros
              </button>
            )}
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

      {hub.isPrivate &&
        user?.id &&
        hub.creatorId &&
        user.id === hub.creatorId && (
          <InviteToHubModal
            open={inviteHubOpen}
            onClose={() => setInviteHubOpen(false)}
            hubId={hub.id}
            partners={acceptedPartners}
            prefersReducedMotion={reduced}
          />
        )}
    </motion.div>
  )
}
