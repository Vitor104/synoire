import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { PartnerAvatar } from '@/components/dashboard/PartnerAvatar'
import { LockIcon } from '@/components/premium/LockIcon'
import { AppToast } from '@/components/ui/AppToast'
import { getOrCreateHubInviteToken, grantHubAccess, listHubAccess } from '@/lib/hubAccess'
import { copyHubInviteUrl } from '@/lib/hubs/hubInviteUrl'
import type { StudyPartnerView } from '@/lib/studyPartners'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

type InviteToHubModalProps = {
  open: boolean
  onClose: () => void
  hubId: string
  hubSlug: string
  creatorId: string
  partners: StudyPartnerView[]
  prefersReducedMotion: boolean
}

export function InviteToHubModal({
  open,
  onClose,
  hubId,
  hubSlug,
  creatorId,
  partners,
  prefersReducedMotion,
}: InviteToHubModalProps) {
  const [grantedIds, setGrantedIds] = useState<Set<string>>(() => new Set())
  const [toast, setToast] = useState({ message: '', visible: false })
  const [loadingGrants, setLoadingGrants] = useState(false)

  const staggerC = pageStaggerContainer(prefersReducedMotion)
  const staggerItem = pageStaggerItem(prefersReducedMotion)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingGrants(true)
    void listHubAccess(hubId).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setGrantedIds(new Set(result.data.map((g) => g.userId)))
      }
      setLoadingGrants(false)
    })
    return () => {
      cancelled = true
    }
  }, [open, hubId])

  useEffect(() => {
    if (!open) {
      setGrantedIds(new Set())
      setLoadingGrants(false)
      setToast({ message: '', visible: false })
    }
  }, [open])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleGrant = useCallback(
    async (partnerId: string, username: string) => {
      const result = await grantHubAccess(hubId, partnerId)
      if (!result.ok) {
        setToast({ message: result.message, visible: true })
        return
      }
      setGrantedIds((prev) => new Set(prev).add(partnerId))
      if (!result.alreadyGranted) {
        setToast({
          message: `Acesso ao Hub liberado para @${username}!`,
          visible: true,
        })
      }
    },
    [hubId],
  )

  const handleCopyInviteLink = useCallback(async () => {
    const tokenResult = await getOrCreateHubInviteToken(hubId, creatorId)
    if (!tokenResult.ok) {
      setToast({ message: tokenResult.message, visible: true })
      return
    }
    const ok = await copyHubInviteUrl(hubSlug, tokenResult.data)
    setToast({
      message: ok
        ? 'Link de convite copiado!'
        : 'Não foi possível copiar o link. Tente novamente.',
      visible: true,
    })
  }, [hubId, hubSlug, creatorId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-to-hub-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 px-6 backdrop-blur-sm"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={handleClose}
          >
            <motion.div
              className="pointer-events-auto flex max-h-[min(85dvh,28rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/5 bg-panel shadow-[0_0_24px_-4px_rgba(163,163,79,0.25)]"
              variants={staggerC}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                variants={staggerItem}
                className="shrink-0 border-b border-white/5 p-6 pb-4"
              >
                <h2
                  id="invite-to-hub-title"
                  className="text-lg font-semibold text-primary"
                >
                  Convidar membros
                </h2>
                <p className="mt-2 text-sm text-secondary">
                  Libere o acesso ao hub privado para seus parceiros de estudo.
                </p>
              </motion.div>

              <motion.ul
                variants={staggerItem}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-2"
              >
                {loadingGrants ? (
                  <li className="px-2 py-6 text-center text-sm text-secondary">
                    Carregando convites…
                  </li>
                ) : partners.length === 0 ? (
                  <li className="px-2 py-6 text-center text-sm text-secondary">
                    Você ainda não tem parceiros aceitos.
                  </li>
                ) : (
                  partners.map((partner) => {
                    const invited = grantedIds.has(partner.id)
                    return (
                      <li
                        key={partner.id}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                      >
                        <PartnerAvatar partner={partner} className="h-9 w-9" />
                        <motion.div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-primary">
                            {partner.displayName}
                          </p>
                          <p className="text-[11px] text-secondary">
                            🔥 {partner.currentStreak}{' '}
                            {partner.currentStreak === 1 ? 'dia' : 'dias'}
                          </p>
                        </motion.div>
                        <button
                          type="button"
                          disabled={invited}
                          onClick={() => void handleGrant(partner.id, partner.username)}
                          className="shrink-0 rounded-lg border border-firefly/30 bg-firefly/10 px-2.5 py-1.5 text-[11px] font-medium text-firefly transition hover:brightness-110 disabled:cursor-default disabled:border-white/10 disabled:bg-white/5 disabled:text-secondary"
                        >
                          {invited ? 'Convidado' : 'Convidar para o Hub'}
                        </button>
                      </li>
                    )
                  })
                )}
              </motion.ul>

              <motion.div
                variants={staggerItem}
                className="shrink-0 border-t border-white/5 px-4 py-4"
              >
                <p className="mb-3 text-xs text-secondary">
                  Ou compartilhe um link com acesso direto ao hub privado:
                </p>
                <button
                  type="button"
                  onClick={() => void handleCopyInviteLink()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-firefly/30 bg-firefly/10 py-3 text-sm font-medium text-firefly transition hover:brightness-110"
                >
                  <LockIcon className="h-3.5 w-3.5 opacity-80" aria-hidden />
                  Copiar link de convite
                </button>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="shrink-0 border-t border-white/5 p-4"
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl px-4 py-2 text-sm text-secondary hover:bg-white/5 hover:text-primary"
                >
                  Fechar
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppToast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  )
}
