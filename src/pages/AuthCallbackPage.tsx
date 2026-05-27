import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  clearOAuthCallbackFromUrl,
  getOAuthCallbackError,
  hasOAuthCodeInUrl,
  isOAuthCallbackUrl,
  OAUTH_PENDING_STORAGE_KEY,
  OAUTH_SESSION_FAILED_MESSAGE,
} from '@/lib/auth/oauthCallback'
import { writeOAuthReturnFlash } from '@/lib/auth/oauthReturnFlash'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

const OAUTH_CALLBACK_TIMEOUT_MS = 15_000

function clearOAuthPendingFlag(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(OAUTH_PENDING_STORAGE_KEY)
}

function failOAuthAndRedirect(navigate: NavigateFunction, message: string): void {
  clearOAuthPendingFlag()
  writeOAuthReturnFlash(message)
  clearOAuthCallbackFromUrl()
  navigate('/entrar', { replace: true })
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { isSessionReady, isLoading: authLoading } = useAuth()
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)
  const [message, setMessage] = useState('Concluindo login com Google...')
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return

    const urlError = getOAuthCallbackError()
    if (urlError) {
      handledRef.current = true
      failOAuthAndRedirect(navigate, urlError)
      return
    }

    if (!isOAuthCallbackUrl() && !hasOAuthCodeInUrl()) {
      handledRef.current = true
      navigate('/entrar', { replace: true })
      return
    }

    const timeoutId = window.setTimeout(() => {
      if (handledRef.current) return
      handledRef.current = true
      failOAuthAndRedirect(navigate, OAUTH_SESSION_FAILED_MESSAGE)
    }, OAUTH_CALLBACK_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [navigate])

  useEffect(() => {
    if (handledRef.current) return

    if (isSessionReady) {
      handledRef.current = true
      clearOAuthPendingFlag()
      clearOAuthCallbackFromUrl()
      navigate('/painel', { replace: true })
      return
    }

    setMessage(
      authLoading ?
        'Concluindo login com Google...'
      : 'Aguardando confirmacao da sessao...',
    )
  }, [authLoading, isSessionReady, navigate])

  return (
    <motion.div
      className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16 text-center"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.h1 variants={item} className="text-2xl font-semibold text-primary">
        Entrando
      </motion.h1>
      <motion.p variants={item} className="mt-3 text-sm leading-relaxed text-secondary">
        {message}
      </motion.p>
    </motion.div>
  )
}
