import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { writeBillingReturnFlash } from '@/lib/billing/billingReturnFlash'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

const REDIRECT_DELAY_MS = 1200

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function BillingReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading, isSessionReady } = useAuth()
  const { waitForGlowActivation } = useUserPlan()
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)
  const [message, setMessage] = useState('Retomando seu retorno do pagamento...')
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return

    let cancelled = false
    const waitForRedirect = async () => {
      await wait(REDIRECT_DELAY_MS)
      return !cancelled
    }

    const payment = searchParams.get('payment')
    if (payment !== 'success' && payment !== 'cancelled') {
      handledRef.current = true
      setMessage('Link de retorno invalido. Redirecionando para o app...')
      void (async () => {
        if (!(await waitForRedirect())) return
        navigate('/painel', { replace: true })
      })()
      return () => {
        cancelled = true
      }
    }

    if (!isSessionReady || authLoading) {
      setMessage(
        payment === 'success' ?
          'Pagamento confirmado. Restaurando sua sessao...'
        : 'Pagamento cancelado. Voltando para o app...',
      )
      return () => {
        cancelled = true
      }
    }

    handledRef.current = true

    void (async () => {
      if (payment === 'cancelled') {
        const cancelledMessage =
          'O pagamento nao foi concluido. Voce pode tentar novamente quando quiser.'
        writeBillingReturnFlash(cancelledMessage)
        setMessage(cancelledMessage)

        if (!(await waitForRedirect())) return

        if (isAuthenticated) {
          navigate('/painel', { replace: true })
          return
        }

        navigate('/entrar', {
          replace: true,
          state: { from: '/painel' },
        })
        return
      }

      if (!isAuthenticated) {
        const loginMessage =
          'Pagamento confirmado. Faca login para concluir seu retorno ao Synoire.'
        writeBillingReturnFlash(loginMessage)
        setMessage(loginMessage)
        if (!(await waitForRedirect())) return
        navigate('/entrar', {
          replace: true,
          state: { from: '/painel' },
        })
        return
      }

      setMessage('Pagamento confirmado. Estamos ativando seu Glow...')
      const activated = await waitForGlowActivation()
      if (cancelled) return
      const successMessage =
        activated ?
          'Bem-vindo ao Synoire Glow! Seus recursos premium foram ativados.'
        : 'Pagamento recebido. A ativacao pode levar alguns instantes - atualize a pagina em breve.'

      writeBillingReturnFlash(successMessage)
      setMessage(successMessage)
      if (!(await waitForRedirect())) return
      navigate('/painel', { replace: true })
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, isSessionReady, navigate, searchParams, waitForGlowActivation])

  return (
    <motion.div
      className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16 text-center"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.span
        variants={item}
        className="mx-auto inline-flex rounded-full border border-firefly/25 bg-firefly/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-firefly"
      >
        Synoire Glow
      </motion.span>
      <motion.h1 variants={item} className="mt-6 text-2xl font-semibold text-primary">
        Confirmando seu retorno
      </motion.h1>
      <motion.p variants={item} className="mt-3 text-sm leading-relaxed text-secondary">
        {message}
      </motion.p>
    </motion.div>
  )
}
