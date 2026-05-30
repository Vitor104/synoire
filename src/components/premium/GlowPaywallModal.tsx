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

const DEFAULT_PAYWALL_MESSAGE =
  'Saia do plano Free e destrave a camada premium do Synoire com uma assinatura mensal.'

const FREE_FEATURES = [
  {
    title: 'Base para estudar no seu ritmo',
    detail: 'Entre em salas abertas e explore a experiencia principal da plataforma.',
  },
  {
    title: 'Rotina essencial de foco',
    detail: 'Mantenha sua consistencia com os recursos centrais do dia a dia.',
  },
  {
    title: 'Sem compromisso para comecar',
    detail: 'Conheca o app, crie sua rotina e evolua antes de dar o proximo passo.',
  },
] as const

const GLOW_FEATURES = [
  {
    title: 'Salas privadas e hubs exclusivos',
    detail: 'Crie espacos mais reservados para estudar com seus parceiros e comunidades.',
  },
  {
    title: 'Temas imersivos premium',
    detail: 'Personalize a experiencia da sala com ambientes exclusivos do Glow.',
  },
  {
    title: 'Analytics avancados e trilhas',
    detail: 'Acompanhe melhor sua evolucao com recursos premium de leitura de progresso.',
  },
  {
    title: 'Mais liberdade para crescer',
    detail: 'Desbloqueie as funcionalidades premium que ampliam sua rotina dentro do app.',
  },
] as const

type FeatureItem = {
  title: string
  detail: string
}

function FeatureList({
  items,
  iconClassName,
}: {
  items: readonly FeatureItem[]
  iconClassName: string
}) {
  return (
    <ul className="mt-6 list-none space-y-4 p-0">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <CheckIcon className={`mt-0.5 shrink-0 ${iconClassName}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">
              {item.detail}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function GlowPaywallModal() {
  const { paywallOpen, paywallMessage, closePaywall } = useUserPlan()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const staggerC = pageStaggerContainer(prefersReducedMotion)
  const staggerItem = pageStaggerItem(prefersReducedMotion)

  useEffect(() => {
    if (paywallOpen) void getStripe()
  }, [paywallOpen])

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

  const contextualMessage = paywallMessage ?? DEFAULT_PAYWALL_MESSAGE

  return (
    <AnimatePresence>
      {paywallOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="glow-paywall-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-night/85 px-4 backdrop-blur-md sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePaywall}
        >
          <motion.div
            className="pointer-events-auto relative flex max-h-[min(92dvh,44rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-firefly/20 bg-panel shadow-[0_0_36px_-8px_rgba(163,163,79,0.28)]"
            variants={staggerC}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(163,163,79,0.16),transparent_72%)]" />

            <button
              type="button"
              aria-label="Fechar modal"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-night/60 text-lg text-secondary transition hover:border-white/20 hover:text-primary"
              onClick={closePaywall}
            >
              ×
            </button>

            <div className="relative shrink-0 border-b border-white/5 px-5 py-6 sm:px-8 sm:py-7">
              <motion.span
                variants={staggerItem}
                className="inline-flex rounded-full border border-firefly/25 bg-firefly/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-firefly"
              >
                Acesso Glow
              </motion.span>

              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <motion.h2
                    id="glow-paywall-title"
                    variants={staggerItem}
                    className="text-2xl font-semibold leading-tight text-primary sm:text-3xl"
                  >
                    Eleve seu foco com o Synoire Glow.
                  </motion.h2>
                  <motion.p
                    variants={staggerItem}
                    className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary sm:text-[15px]"
                  >
                    {contextualMessage}
                  </motion.p>
                </div>

                <motion.div
                  variants={staggerItem}
                  className="inline-flex self-start rounded-xl border border-white/10 bg-night/60 px-3 py-2 text-xs font-medium text-secondary"
                >
                  Plano disponivel:
                  <span className="ml-1 text-primary">mensal</span>
                </motion.div>
              </div>
            </div>

            <motion.div
              variants={staggerItem}
              className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <section className="flex flex-col rounded-2xl border border-white/10 bg-surface/80 p-5 sm:p-6">
                  <span className="inline-flex self-start rounded-full border border-white/10 bg-night/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary">
                    Free
                  </span>
                  <h3 className="mt-5 text-3xl font-semibold text-primary">
                    Gratuito
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-secondary">
                    O essencial para entrar no Synoire, estudar com frequencia e conhecer a experiencia da plataforma.
                  </p>

                  <FeatureList
                    items={FREE_FEATURES}
                    iconClassName="text-secondary/70"
                  />

                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={closePaywall}
                      className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-primary transition hover:border-white/20 hover:bg-elevated"
                    >
                      Continuar no Free
                    </button>
                  </div>
                </section>

                <section className="relative flex flex-col overflow-visible rounded-2xl border border-firefly/35 bg-gradient-to-br from-firefly/10 via-panel to-elevated p-5 shadow-[0_0_30px_-10px_rgba(163,163,79,0.35)] sm:p-6">
                  <span className="absolute right-5 top-0 -translate-y-1/2 rounded-full border border-firefly/40 bg-firefly px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-night">
                    Premium
                  </span>

                  <span className="inline-flex self-start rounded-full border border-firefly/25 bg-firefly/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-firefly">
                    Glow mensal
                  </span>
                  <div className="mt-5 flex items-end gap-2">
                    <h3 className="text-3xl font-semibold text-primary">Glow</h3>
                    <span className="pb-1 text-sm font-medium text-firefly">
                      assinatura mensal
                    </span>
                  </div>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary">
                    Desbloqueie o pacote premium para estudar com mais profundidade, personalizacao e espaco para evoluir.
                  </p>

                  <FeatureList
                    items={GLOW_FEATURES}
                    iconClassName="text-firefly"
                  />

                  <div className="mt-auto border-t border-white/10 pt-6">
                    <button
                      type="button"
                      onClick={() => void handleUpgrade()}
                      disabled={isCheckingOut}
                      className="w-full rounded-xl bg-firefly px-4 py-3 text-sm font-medium text-night transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                    >
                      {isCheckingOut ? 'Redirecionando…' : 'Assinar Glow'}
                    </button>
                    <p className="mt-3 text-xs leading-relaxed text-secondary">
                      Checkout seguro com ativacao automatica apos a confirmacao do pagamento.
                    </p>
                  </div>
                </section>
              </div>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="relative shrink-0 border-t border-white/5 bg-night/20 px-5 py-4 sm:px-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-secondary">
                  O plano Free continua disponivel para explorar o app no seu ritmo.
                </p>
                <button
                  type="button"
                  onClick={closePaywall}
                  className="self-start text-sm text-secondary transition hover:text-primary"
                >
                  Talvez depois
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
