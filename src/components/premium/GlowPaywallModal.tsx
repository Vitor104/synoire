import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { CheckIcon } from '@/components/premium/CheckIcon'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { createGlowCheckout } from '@/lib/billing/createGlowCheckout'
import { getStripe } from '@/lib/stripe/publicKey'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

const GOD_KEY = 'GOD_KEY_TO_PREMIUM_ACTIVATE'

const BENEFITS = [
  'Salas Privadas para amigos',
  'Hubs Exclusivos',
  'Temas Imersivos Premium',
  'Analytics Avançados',
  'Trilhas de Evolução',
] as const

export function GlowPaywallModal() {
  const { paywallOpen, paywallMessage, closePaywall, setPlanTier } = useUserPlan()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const staggerC = pageStaggerContainer(prefersReducedMotion)
  const staggerItem = pageStaggerItem(prefersReducedMotion)

  useEffect(() => {
    if (paywallOpen) void getStripe()
  }, [paywallOpen])

  const tryActivateGodKey = useCallback(() => {
    const key = prompt('Enter God Key:')
    if (key === null) return false
    if (key === GOD_KEY) {
      setPlanTier('glow')
      closePaywall()
      alert('✨ MODO GLOW ATIVADO COM SUCESSO (SIMULADO)!')
      return true
    }
    alert('Chave inválida. Tente novamente ou use "Talvez depois".')
    return false
  }, [setPlanTier, closePaywall])

  const handleTitleGodKey = useCallback(
    (e: React.MouseEvent) => {
      if (!e.shiftKey) return
      tryActivateGodKey()
    },
    [tryActivateGodKey],
  )

  const handleUpgrade = useCallback(async () => {
    if (isCheckingOut) return
    setIsCheckingOut(true)
    try {
      const result = await createGlowCheckout()
      if (!result.ok) {
        alert(result.message)
        return
      }
      window.location.href = result.url
    } finally {
      setIsCheckingOut(false)
    }
  }, [isCheckingOut])

  useEffect(() => {
    if (!paywallOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePaywall()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paywallOpen, closePaywall])

  return (
    <AnimatePresence>
      {paywallOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="glow-paywall-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-night/80 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePaywall}
        >
          <motion.div
            className="pointer-events-auto w-full max-w-md rounded-2xl border border-firefly/30 bg-panel p-6 shadow-[0_0_24px_-4px_rgba(163,163,79,0.25)]"
            variants={staggerC}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h2
              id="glow-paywall-title"
              variants={staggerItem}
              className="cursor-default text-lg font-semibold leading-snug text-primary"
              onDoubleClick={handleTitleGodKey}
            >
              Desperte seu foco absoluto. Assine o Synoire Glow.
            </motion.h2>

            {paywallMessage && (
              <motion.p variants={staggerItem} className="mt-3 text-sm leading-relaxed text-secondary">
                {paywallMessage}
              </motion.p>
            )}

            <motion.ul variants={staggerItem} className="mt-6 list-none space-y-3 p-0">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-secondary">
                  <CheckIcon className="mt-0.5 text-firefly" />
                  <span className="min-w-0 flex-1 leading-snug">{benefit}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={staggerItem} className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void handleUpgrade()}
                disabled={isCheckingOut}
                className="w-full rounded-xl bg-firefly px-4 py-3 text-sm font-medium text-night hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
              >
                {isCheckingOut ? 'Redirecionando…' : 'Fazer Upgrade'}
              </button>
              <button
                type="button"
                onClick={closePaywall}
                disabled={isCheckingOut}
                className="w-full rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-secondary disabled:opacity-50"
              >
                Talvez depois
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
