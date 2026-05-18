import { motion } from 'motion/react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useProfile } from '@/hooks/useProfile'
import { formatTargetExamSlug, MAX_BIO_LENGTH } from '@/lib/profile'
import {
  pageStaggerContainer,
  pageStaggerItem,
  pageStaggerListInner,
} from '@/motion/pageStagger'

const inputClass =
  'mt-2 w-full rounded-xl border border-border bg-night/60 px-4 py-3 text-sm text-primary placeholder:text-secondary/60 focus:border-firefly/40 focus:outline-none focus:ring-1 focus:ring-firefly/30'

function initialsFromName(name: string | null): string {
  if (!name?.trim()) return 'US'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  const a = parts[0][0]
  const b = parts[parts.length - 1][0]
  return `${a}${b}`.toUpperCase()
}

function FieldBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-secondary/80">
        {label}
      </p>
      <div className="mt-1.5 text-sm text-primary">{children}</div>
    </div>
  )
}

function LightningWatermark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

function HubGlyph({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-elevated ${className ?? ''}`}
      aria-hidden
    >
      <svg
        className="h-2.5 w-2.5 text-secondary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </span>
  )
}

export function ProfilePage() {
  const reducedMotion = usePrefersReducedMotion()
  const { profile, isLoading, error, isSaving, updateFocus } = useProfile()
  const [targetExamInput, setTargetExamInput] = useState('')
  const [bioInput, setBioInput] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setTargetExamInput(profile.targetExam ?? '')
    setBioInput(profile.bio ?? '')
  }, [profile])

  const c = pageStaggerContainer(reducedMotion)
  const item = pageStaggerItem(reducedMotion)
  const listInner = pageStaggerListInner(reducedMotion)

  const dash = '—'
  const displayName = profile?.displayName ?? null
  const initials = useMemo(() => initialsFromName(displayName), [displayName])
  const nameLine = displayName?.trim() || dash
  const hubLine = dash
  const examLine = formatTargetExamSlug(profile?.targetExam) ?? profile?.targetExam?.trim() ?? dash
  const bioText = profile?.bio?.trim()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const result = await updateFocus({
      targetExam: targetExamInput,
      bio: bioInput,
    })

    if (result.ok) {
      setFormSuccess('Foco atualizado com sucesso.')
    } else {
      setFormError(result.message)
    }
  }

  if (isLoading) {
    return (
      <motion.div
        className="mx-auto flex max-w-2xl items-center justify-center py-24 text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        aria-busy="true"
        aria-label="Carregando perfil"
      >
        <span className="text-sm">Carregando…</span>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {error && (
        <p
          className="mb-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral"
          role="alert"
        >
          {error}
        </p>
      )}

      <motion.article
        whileHover={
          reducedMotion
            ? undefined
            : { scale: 1.008, transition: { duration: 0.2 } }
        }
        className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-elevated shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
      >
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-firefly shadow-[0_0_24px_rgba(163,163,79,0.35)]"
          aria-hidden
        />
        <LightningWatermark className="pointer-events-none absolute right-5 top-5 h-9 w-9 text-firefly/[0.12]" />

        <motion.div
          variants={c}
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
          className="relative grid gap-8 p-8 pl-9 md:grid-cols-[auto_1fr] md:gap-10 md:p-10 md:pl-11"
        >
          <motion.div variants={item} className="flex flex-col items-center md:items-start">
            <motion.div className="relative">
              {!reducedMotion && (
                <motion.div
                  className="absolute -inset-3 rounded-full bg-firefly/25 blur-xl"
                  animate={{
                    opacity: [0.35, 0.65, 0.35],
                    scale: [1, 1.12, 1],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              <motion.div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-gradient-to-br from-firefly to-aqua text-lg font-bold tracking-tight text-night shadow-[0_0_0_3px_rgba(163,163,79,0.35),0_0_28px_rgba(163,163,79,0.2)]">
                {initials}
              </motion.div>
            </motion.div>
            <div className="mt-5 flex items-center gap-2 rounded-full border border-border bg-night/60 px-3 py-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/70" />
              <span className="text-[0.65rem] font-medium uppercase tracking-widest text-secondary">
                Offline
              </span>
            </div>
          </motion.div>

          <motion.div variants={listInner} className="min-w-0 space-y-8">
            <motion.header variants={item}>
              <h1 className="text-2xl font-semibold tracking-tight text-primary">
                Perfil
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-secondary">
                Nome público, concurso-alvo e preferências de foco
              </p>
            </motion.header>

            <motion.div variants={item} className="space-y-6">
              <FieldBlock label="Nome">{nameLine}</FieldBlock>

              <FieldBlock label="Hub principal">
                <span className="inline-flex items-center gap-2">
                  <HubGlyph />
                  <span>{hubLine}</span>
                </span>
              </FieldBlock>

              <FieldBlock label="Concurso-alvo">{examLine}</FieldBlock>

              <FieldBlock label="Bio">
                {bioText ? (
                  <p className="max-w-prose whitespace-pre-wrap leading-relaxed text-secondary">
                    {bioText}
                  </p>
                ) : (
                  <span className="text-secondary">{dash}</span>
                )}
              </FieldBlock>

              <FieldBlock label="XP / nível">
                <motion.span
                  className="inline-flex cursor-default rounded-lg border border-aqua/35 bg-aqua/15 px-2.5 py-1 text-xs font-medium text-aqua"
                  whileHover={
                    reducedMotion ? undefined : { scale: 1.04, filter: 'brightness(1.12)' }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  Em breve
                </motion.span>
              </FieldBlock>
            </motion.div>

            <motion.div variants={item} className="h-px bg-border" />

            <motion.section variants={item} className="space-y-4">
              <motion.div>
                <h2 className="text-sm font-semibold text-primary">Definir foco</h2>
                <p className="mt-1 text-sm text-secondary">
                  Atualize seu concurso-alvo e bio públicos
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm text-secondary" htmlFor="profile-target-exam">
                  Concurso-alvo
                  <input
                    id="profile-target-exam"
                    type="text"
                    value={targetExamInput}
                    onChange={(e) => {
                      setTargetExamInput(e.target.value)
                      setFormError(null)
                      setFormSuccess(null)
                    }}
                    placeholder="policia-federal"
                    autoComplete="off"
                    className={inputClass}
                    disabled={isSaving}
                  />
                </label>

                <label className="block text-sm text-secondary" htmlFor="profile-bio">
                  Bio
                  <textarea
                    id="profile-bio"
                    value={bioInput}
                    onChange={(e) => {
                      setBioInput(e.target.value)
                      setFormError(null)
                      setFormSuccess(null)
                    }}
                    placeholder="Estudando 4h por dia. Rumo à aprovação!"
                    rows={4}
                    maxLength={MAX_BIO_LENGTH}
                    className={`${inputClass} resize-y`}
                    disabled={isSaving}
                  />
                </label>

                {(formError || formSuccess) && (
                  <p
                    role="status"
                    className={
                      formError
                        ? 'text-sm text-coral'
                        : 'text-sm text-firefly'
                    }
                  >
                    {formError ?? formSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  aria-busy={isSaving}
                  className="rounded-xl bg-firefly px-5 py-2.5 text-sm font-medium text-night transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Salvando…' : 'Salvar foco'}
                </button>
              </form>
            </motion.section>
          </motion.div>
        </motion.div>
      </motion.article>
    </div>
  )
}
