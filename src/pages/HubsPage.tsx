import { motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { CreatePrivateHubModal } from '@/components/hub/CreatePrivateHubModal'
import { HubListCard } from '@/components/hub/HubListCard'
import { HubRequestModal } from '@/components/hub/HubRequestModal'
import { FireflyIcon } from '@/components/landing/FireflyIcon'
import { LockIcon } from '@/components/premium/LockIcon'
import { AppToast } from '@/components/ui/AppToast'
import { useHubs } from '@/contexts/HubsContext'
import { useJoinedHubs } from '@/contexts/JoinedHubsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  pageStaggerContainer,
  pageStaggerItem,
  pageStaggerListInner,
} from '@/motion/pageStagger'

const TOAST_MESSAGE = 'Hub Privado criado com sucesso!'

export function HubsPage() {
  const { hasGlowAccess, openPaywall } = useUserPlan()
  const { hubs, isLoading, error, createPrivateHub, refresh } = useHubs()
  const { joinedHubs, isJoined, joinHub, leaveHub } = useJoinedHubs()
  const [requestOpen, setRequestOpen] = useState(false)
  const [createPrivateOpen, setCreatePrivateOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const count = hubs.length
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)
  const listInner = pageStaggerListInner(reduced)

  const handleCreatePrivateClick = useCallback(() => {
    if (!hasGlowAccess) {
      openPaywall()
      return
    }
    setCreatePrivateOpen(true)
  }, [hasGlowAccess, openPaywall])

  const handleCreatePrivateHub = useCallback(
    async (payload: { name: string; iconEmoji?: string }) => {
      setActionError(null)
      const result = await createPrivateHub(payload.name, payload.iconEmoji)
      if (!result.ok) {
        if (result.code === 'forbidden') {
          openPaywall()
          return
        }
        setActionError(result.message)
        throw new Error(result.message)
      }
      await refresh()
      setToastVisible(true)
    },
    [createPrivateHub, openPaywall, refresh],
  )

  const handleJoin = useCallback(
    async (slug: string) => {
      setActionError(null)
      const ok = await joinHub(slug)
      if (!ok) {
        setActionError('Não foi possível entrar no hub.')
      }
    },
    [joinHub],
  )

  const handleLeave = useCallback(
    async (slug: string) => {
      setActionError(null)
      await leaveHub(slug)
    },
    [leaveHub],
  )

  return (
    <motion.div
      className="mx-auto max-w-6xl"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.header variants={item} className="mb-10">
        <motion.div variants={item} className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Hubs de estudo
          </h1>
          <p className="text-sm text-secondary">
            {isLoading ? 'Carregando…' : `${count} hubs disponíveis`}
          </p>
        </motion.div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary">
          Cada hub agrupa salas e metas alinhadas ao seu foco de estudo.
        </p>
        <button
          type="button"
          onClick={handleCreatePrivateClick}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm text-secondary transition hover:border-firefly/25 hover:text-primary hover:shadow-[0_0_20px_-6px_rgba(163,163,79,0.15)]"
        >
          <LockIcon className="h-4 w-4 text-firefly/70" />
          <FireflyIcon className="h-1.5 w-1.5" />
          <span>+ Criar Hub Privado</span>
        </button>
      </motion.header>

      {(error || actionError) && (
        <motion.p variants={item} className="mb-6 text-sm text-red-400/90" role="alert">
          {error ?? actionError}
        </motion.p>
      )}

      <motion.section variants={item} className="mb-10">
        <h2 className="text-sm font-medium text-primary">Seus Ambientes de Foco</h2>
        {joinedHubs.length === 0 ? (
          <p className="mt-3 text-sm text-secondary">
            Você ainda não selecionou seus estudos de foco.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joinedHubs.map((hub) => (
              <li key={`joined-${hub.slug}`}>
                <HubListCard
                  hub={hub}
                  isJoined
                  onJoin={() => void handleJoin(hub.slug)}
                  onLeave={() => void handleLeave(hub.slug)}
                />
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      {isLoading ? (
        <motion.p variants={item} className="text-sm text-secondary">
          Carregando hubs…
        </motion.p>
      ) : hubs.length === 0 && !error ? (
        <motion.p variants={item} className="text-sm text-secondary">
          Nenhum hub encontrado.
        </motion.p>
      ) : (
        <motion.ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={listInner}
        >
          {hubs.map((hub) => (
            <motion.li key={hub.slug} variants={item}>
              <HubListCard
                hub={hub}
                isJoined={isJoined(hub.slug)}
                onJoin={() => void handleJoin(hub.slug)}
                onLeave={() => void handleLeave(hub.slug)}
              />
            </motion.li>
          ))}
          <motion.li variants={item}>
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="flex h-full min-h-[8.5rem] w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-transparent px-5 py-5 text-sm text-secondary transition hover:border-white/20 hover:text-primary"
            >
              + Não encontrou seu hub?
            </button>
          </motion.li>
        </motion.ul>
      )}

      <HubRequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        prefersReducedMotion={reduced}
      />

      <CreatePrivateHubModal
        open={createPrivateOpen}
        onClose={() => setCreatePrivateOpen(false)}
        onCreate={handleCreatePrivateHub}
        prefersReducedMotion={reduced}
      />

      <AppToast
        message={TOAST_MESSAGE}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </motion.div>
  )
}
