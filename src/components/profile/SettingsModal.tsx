import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { mapAuthError } from '@/lib/auth/errors'
import { MIN_PASSWORD_LENGTH, WEAK_PASSWORD_MESSAGE } from '@/lib/auth/constants'
import { createPortalSession } from '@/lib/billing/createPortalSession'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-primary placeholder:text-secondary/60 focus:border-firefly/40 focus:outline-none focus:ring-1 focus:ring-firefly/30'

const GENERIC_ERROR = 'Não foi possível concluir a operação. Tente novamente.'

type SettingsModalProps = {
  open: boolean
  onClose: () => void
  prefersReducedMotion: boolean
  onToast: (message: string) => void
}

export function SettingsModal({
  open,
  onClose,
  prefersReducedMotion,
  onToast,
}: SettingsModalProps) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { planTier, hasGlowAccess, openPaywall } = useUserPlan()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const isBusy = isUpdatingPassword || isManagingSubscription || isDeletingAccount
  const staggerC = pageStaggerContainer(prefersReducedMotion)
  const staggerItem = pageStaggerItem(prefersReducedMotion)

  const handleClose = useCallback(() => {
    setNewPassword('')
    setConfirmPassword('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, isBusy, handleClose])

  const handleUpdatePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      onToast('As senhas não coincidem.')
      return
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      onToast(WEAK_PASSWORD_MESSAGE)
      return
    }

    const supabase = getSupabase()
    if (!isSupabaseConfigured || !supabase) {
      onToast(GENERIC_ERROR)
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        onToast(mapAuthError(error))
        return
      }
      setNewPassword('')
      setConfirmPassword('')
      onToast('Senha atualizada com sucesso.')
    } catch (err) {
      onToast(mapAuthError(err))
    } finally {
      setIsUpdatingPassword(false)
    }
  }, [newPassword, confirmPassword, onToast])

  const handleManageSubscription = useCallback(async () => {
    setIsManagingSubscription(true)
    try {
      const result = await createPortalSession()
      if (!result.ok) {
        onToast(result.message)
        return
      }

      window.location.href = result.url
    } catch (err) {
      onToast(err instanceof Error ? err.message : GENERIC_ERROR)
    } finally {
      setIsManagingSubscription(false)
    }
  }, [onToast])

  const handleUpgrade = useCallback(() => {
    onClose()
    openPaywall('Gerencie sua assinatura nas configurações da conta.')
  }, [onClose, openPaywall])

  const handleDeleteAccount = useCallback(async () => {
    const confirmed = window.confirm(
      'Tem certeza? Todos os seus históricos de estudo serão perdidos.',
    )
    if (!confirmed) return

    const supabase = getSupabase()
    if (!isSupabaseConfigured || !supabase) {
      onToast(GENERIC_ERROR)
      return
    }

    setIsDeletingAccount(true)
    try {
      const { error } = await supabase.rpc('delete_own_account')
      if (error) {
        onToast(error.message || GENERIC_ERROR)
        return
      }
      await signOut()
      navigate('/entrar', { replace: true })
    } catch (err) {
      onToast(err instanceof Error ? err.message : GENERIC_ERROR)
    } finally {
      setIsDeletingAccount(false)
    }
  }, [onToast, signOut, navigate])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-night/80 px-6 backdrop-blur-sm"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          onClick={isBusy ? undefined : handleClose}
        >
          <motion.div
            className="pointer-events-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-panel p-6 shadow-xl"
            variants={staggerC}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h2
              id="settings-modal-title"
              variants={staggerItem}
              className="text-lg font-semibold text-primary"
            >
              Configurações da Conta
            </motion.h2>

            {/* Seção A: Segurança */}
            <motion.section variants={staggerItem} className="mt-6">
              <h3 className="text-sm font-medium text-primary">Segurança</h3>
              <p className="mt-1 text-sm text-secondary">Alterar senha de acesso</p>

              <label className="mt-4 block text-sm text-secondary">
                Nova Senha
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  disabled={isBusy}
                />
              </label>

              <label className="mt-4 block text-sm text-secondary">
                Confirmar Nova Senha
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  disabled={isBusy}
                />
              </label>

              <button
                type="button"
                onClick={() => void handleUpdatePassword()}
                disabled={isBusy}
                className="mt-4 w-full rounded-xl border border-firefly/30 bg-firefly/10 px-4 py-2.5 text-sm font-medium text-firefly transition hover:border-firefly/50 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Atualizando…' : 'Atualizar Senha'}
              </button>
            </motion.section>

            {/* Seção B: Assinatura */}
            <motion.section
              variants={staggerItem}
              className="mt-8 border-t border-white/10 pt-6"
            >
              <h3 className="text-sm font-medium text-primary">Assinatura</h3>
              <p className="mt-1 text-sm text-secondary">Synoire Glow</p>

              {hasGlowAccess ? (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-lg border border-firefly/35 bg-firefly/15 px-2.5 py-1 text-xs font-medium text-firefly shadow-[0_0_12px_-2px_rgba(163,163,79,0.35)]">
                      Premium · Synoire Glow
                    </span>
                    {planTier === 'collective' && (
                      <span className="text-xs text-secondary">Plano coletivo</span>
                    )}
                  </div>
                  {planTier === 'glow' && (
                    <button
                      type="button"
                      onClick={() => void handleManageSubscription()}
                      disabled={isBusy}
                      className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-secondary transition hover:bg-elevated hover:text-primary disabled:opacity-50"
                    >
                      {isManagingSubscription ?
                        'Redirecionando...'
                      : 'Gerenciar Assinatura'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-secondary">
                    Plano atual: <span className="text-primary">Básico</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={isBusy}
                    className="w-full rounded-xl bg-firefly px-4 py-3 text-sm font-medium text-night hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Fazer Upgrade para Glow
                  </button>
                </div>
              )}
            </motion.section>

            {/* Seção C: Zona de Perigo */}
            <motion.section
              variants={staggerItem}
              className="mt-8 border-t border-white/10 pt-6"
            >
              <h3 className="text-sm font-medium text-coral">Zona de Perigo</h3>
              <p className="mt-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
                A exclusão da conta é permanente. Todos os seus históricos de estudo,
                metas e dados de perfil serão apagados e não poderão ser recuperados.
              </p>
              <button
                type="button"
                onClick={() => void handleDeleteAccount()}
                disabled={isBusy}
                className="mt-4 w-full rounded-xl border border-coral/40 px-4 py-2.5 text-sm font-medium text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingAccount ? 'Excluindo…' : 'Excluir Conta Permanentemente'}
              </button>
            </motion.section>

            <motion.div variants={staggerItem} className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="rounded-xl px-4 py-2 text-sm text-secondary hover:bg-elevated hover:text-primary disabled:opacity-50"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
