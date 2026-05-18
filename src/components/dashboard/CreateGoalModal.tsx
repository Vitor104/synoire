import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useJoinedHubs } from '@/contexts/JoinedHubsContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import {
  SUBJECT_NAME_MAX,
  validateCreateGoalInput,
  type CreateUserGoalInput,
  type GoalPeriod,
} from '@/lib/goals'
import {
  pageStaggerContainer,
  pageStaggerItem,
} from '@/motion/pageStagger'

type CreateGoalModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (input: CreateUserGoalInput) => Promise<void>
  prefersReducedMotion: boolean
  isSubmitting?: boolean
}

export function CreateGoalModal({
  open,
  onClose,
  onCreate,
  prefersReducedMotion,
  isSubmitting = false,
}: CreateGoalModalProps) {
  const { joinedHubs } = useJoinedHubs()
  const { hasGlowAccess, openPaywall } = useUserPlan()
  const [hubId, setHubId] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [targetHours, setTargetHours] = useState('10')
  const [period, setPeriod] = useState<GoalPeriod>('weekly')
  const [error, setError] = useState<string | null>(null)

  const staggerC = pageStaggerContainer(prefersReducedMotion)
  const staggerItem = pageStaggerItem(prefersReducedMotion)

  const parsedHours = Number.parseFloat(targetHours.replace(',', '.'))
  const validation = validateCreateGoalInput({
    hubId,
    subjectName,
    targetHours: parsedHours,
    period,
  })
  const canSubmit = validation.ok && !isSubmitting && joinedHubs.length > 0

  useEffect(() => {
    if (!open) return
    if (hubId && joinedHubs.some((h) => h.id === hubId)) return
    setHubId(joinedHubs[0]?.id ?? '')
  }, [open, joinedHubs, hubId])

  const handleClose = useCallback(() => {
    setSubjectName('')
    setTargetHours('10')
    setPeriod('weekly')
    setError(null)
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!hasGlowAccess) {
        openPaywall()
        return
      }
      const result = validateCreateGoalInput({
        hubId,
        subjectName,
        targetHours: Number.parseFloat(targetHours.replace(',', '.')),
        period,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setError(null)
      try {
        await onCreate(result.value)
        setSubjectName('')
        setTargetHours('10')
        setPeriod('weekly')
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível criar a meta.')
      }
    },
    [
      hasGlowAccess,
      openPaywall,
      hubId,
      subjectName,
      targetHours,
      period,
      onCreate,
      handleClose,
    ],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  if (!open) return null

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-goal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.form
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-panel p-6 shadow-xl"
        variants={staggerC}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void handleSubmit(e)}
      >
        <motion.h2
          id="create-goal-title"
          variants={staggerItem}
          className="text-lg font-semibold text-primary"
        >
          Nova meta de estudo
        </motion.h2>
        <motion.p variants={staggerItem} className="mt-2 text-sm text-secondary">
          Defina horas de foco para um hub e acompanhe na trilha de evolução.
        </motion.p>

        {joinedHubs.length === 0 ? (
          <motion.p variants={staggerItem} className="mt-6 text-sm text-secondary">
            Entre em hubs na página Hubs para criar uma meta.
          </motion.p>
        ) : (
          <>
            <motion.label variants={staggerItem} className="mt-6 block text-sm text-secondary">
              Hub
              <select
                value={hubId}
                onChange={(e) => {
                  setHubId(e.target.value)
                  setError(null)
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-primary focus:border-firefly/40 focus:outline-none focus:ring-1 focus:ring-firefly/30"
              >
                {joinedHubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name}
                  </option>
                ))}
              </select>
            </motion.label>

            <motion.label variants={staggerItem} className="mt-4 block text-sm text-secondary">
              Assunto
              <input
                type="text"
                value={subjectName}
                maxLength={SUBJECT_NAME_MAX}
                onChange={(e) => {
                  setSubjectName(e.target.value)
                  setError(null)
                }}
                placeholder="Ex: Revisão Geral"
                className="mt-2 w-full rounded-xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-primary placeholder:text-secondary/60 focus:border-firefly/40 focus:outline-none focus:ring-1 focus:ring-firefly/30"
                autoFocus
              />
            </motion.label>

            <motion.label variants={staggerItem} className="mt-4 block text-sm text-secondary">
              Meta (horas)
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={targetHours}
                onChange={(e) => {
                  setTargetHours(e.target.value)
                  setError(null)
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-primary focus:border-firefly/40 focus:outline-none focus:ring-1 focus:ring-firefly/30"
              />
            </motion.label>

            <motion.label variants={staggerItem} className="mt-4 block text-sm text-secondary">
              Período
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value as GoalPeriod)
                  setError(null)
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-primary focus:border-firefly/40 focus:outline-none focus:ring-1 focus:ring-firefly/30"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </motion.label>
          </>
        )}

        {error && (
          <motion.p variants={staggerItem} className="mt-3 text-sm text-secondary" role="alert">
            {error}
          </motion.p>
        )}

        <motion.div variants={staggerItem} className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-secondary transition hover:border-white/20 hover:text-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-firefly px-4 py-2.5 text-sm font-medium text-night transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Criando…' : 'Criar meta'}
          </button>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}
