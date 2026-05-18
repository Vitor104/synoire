import { useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import { EvolutionTrails } from '@/components/dashboard/EvolutionTrails'
import { FocusPatterns } from '@/components/dashboard/FocusPatterns'
import { GlowLockedOverlay } from '@/components/premium/GlowLockedOverlay'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useStudySessions } from '@/hooks/useStudySessions'
import { useUserStats } from '@/hooks/useUserStats'
import {
  buildHeatmap,
  buildWeeklyBars,
  formatStudyHours,
  minutesStudiedLast7Days,
  minutesStudiedToday,
  toSessionPoints,
} from '@/lib/dashboard/studyAnalytics'
import {
  pageStaggerContainer,
  pageStaggerItem,
  pageStaggerListInner,
} from '@/motion/pageStagger'

const HEATMAP_WEEKS = 4
const HEATMAP_DAYS = 7

function MetricColumn({
  label,
  value,
  hint,
  variants,
}: {
  label: string
  value: string
  hint: string
  variants: Variants
}) {
  return (
    <motion.div variants={variants} className="py-2 sm:px-6 sm:first:pl-0 sm:last:pr-0">
      <p className="text-xs font-medium uppercase tracking-widest text-firefly">{label}</p>
      <p className="mt-3 text-4xl font-semibold tabular-nums text-primary">{value}</p>
      <p className="mt-2 text-sm text-secondary">{hint}</p>
    </motion.div>
  )
}

function heatmapColor(intensity: number): string {
  if (intensity === 0) return 'rgb(26 26 18 / 0.5)'
  return `rgb(163 163 79 / ${0.12 + intensity * 0.18})`
}

export function DashboardPage() {
  const reduced = usePrefersReducedMotion()
  const c = pageStaggerContainer(reduced)
  const item = pageStaggerItem(reduced)
  const listInner = pageStaggerListInner(reduced)

  const { sessions, isLoading: sessionsLoading } = useStudySessions()
  const { stats, isLoading: statsLoading } = useUserStats()
  const isLoading = sessionsLoading || statsLoading

  const points = useMemo(() => toSessionPoints(sessions), [sessions])

  const todayMinutes = useMemo(() => minutesStudiedToday(points), [points])
  const weeklyMinutes = useMemo(() => minutesStudiedLast7Days(points), [points])
  const weeklyBars = useMemo(() => buildWeeklyBars(points), [points])
  const heatmapCells = useMemo(
    () => buildHeatmap(points, HEATMAP_WEEKS, HEATMAP_DAYS),
    [points],
  )

  const weeklyTargetHours = (stats.dailyGoalMinutes * 7) / 60
  const weeklyTargetLabel =
    Number.isInteger(weeklyTargetHours) ?
      `${weeklyTargetHours} h`
    : `${weeklyTargetHours.toFixed(1)} h`

  const highlightBarIndex = useMemo(() => {
    if (weeklyBars.length === 0) return -1
    let maxIdx = 0
    for (let i = 1; i < weeklyBars.length; i++) {
      if (weeklyBars[i].minutes > weeklyBars[maxIdx].minutes) maxIdx = i
    }
    return weeklyBars[maxIdx].minutes > 0 ? maxIdx : -1
  }, [weeklyBars])

  const growthPercent = useMemo(() => {
    if (weeklyBars.length < 7) return null
    const recent = weeklyBars.slice(4).reduce((s, b) => s + b.minutes, 0)
    const prior = weeklyBars.slice(0, 3).reduce((s, b) => s + b.minutes, 0)
    if (prior <= 0) return recent > 0 ? 100 : null
    return Math.round(((recent - prior) / prior) * 100)
  }, [weeklyBars])

  const streakDays = stats.currentStreak
  const streakLabel = streakDays === 1 ? '1 dia' : `${streakDays} dias`

  return (
    <motion.div
      className="mx-auto max-w-5xl"
      variants={c}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      <motion.header variants={item} className="mb-10">
        <h1 className="text-2xl font-semibold text-primary">
          <span className="text-firefly">|</span> Painel
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Visão rápida da sua constância de estudos.
        </p>
      </motion.header>

      <motion.div
        variants={listInner}
        className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        <MetricColumn
          variants={item}
          label="Hoje"
          value={isLoading ? '…' : formatStudyHours(todayMinutes)}
          hint="Horas estudadas hoje"
        />
        <MetricColumn
          variants={item}
          label="Streak"
          value={isLoading ? '…' : streakLabel}
          hint="Sua sequência atual de consistência"
        />
        <MetricColumn
          variants={item}
          label="Meta semanal"
          value={
            isLoading ?
              '…'
            : `${formatStudyHours(weeklyMinutes)} / ${weeklyTargetLabel}`
          }
          hint="Progresso nos últimos 7 dias"
        />
      </motion.div>

      <motion.section variants={item} className="mt-12">
        <motion.div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium text-primary">Evolução semanal</h2>
            <span className="rounded-full border border-firefly/40 bg-firefly/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-firefly">
              Live
            </span>
          </div>
          {growthPercent !== null && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-elevated/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              <span className="text-firefly" aria-hidden>
                {growthPercent >= 0 ? '↑' : '↓'}
              </span>
              {growthPercent >= 0 ? '+' : ''}
              {growthPercent}% crescimento
            </div>
          )}
        </motion.div>
        <div className="mt-8 flex h-36 items-end gap-2 sm:gap-3">
          {weeklyBars.map((bar, i) => {
            const isHighlight = i === highlightBarIndex
            const height = bar.minutes === 0 ? 4 : Math.max(bar.percent, 8)
            return (
              <motion.div
                key={bar.label}
                className="relative flex h-full flex-1 flex-col justify-end"
                variants={item}
                title={`${bar.label}: ${formatStudyHours(bar.minutes)}`}
              >
                <div className="absolute inset-0 rounded-t-sm bg-chart-track" aria-hidden />
                <div
                  className={[
                    'relative w-full rounded-t-sm',
                    isHighlight ? 'bg-chart-highlight' : 'bg-chart-fill',
                  ].join(' ')}
                  style={{ height: `${height}%` }}
                >
                  {isHighlight && (
                    <span
                      className="absolute inset-x-0 top-0 h-px bg-white/80 shadow-[0_0_8px_rgba(245,245,240,0.6)]"
                      aria-hidden
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="mt-10 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 className="text-sm font-medium text-primary">Previsão de Streak</h2>
        <p className="mt-2 text-sm text-secondary">
          Projeção com base no seu ritmo recente.
        </p>
        <GlowLockedOverlay className="mt-6">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums text-firefly">
                {streakDays > 0 ? `+${Math.min(streakDays + 4, streakDays * 2)} dias` : '—'}
              </span>
              <span className="text-xs text-secondary">
                {sessions.length >= 5 ? 'confiança alta' : 'em construção'}
              </span>
            </div>
            <div className="flex h-24 items-end gap-1">
              {weeklyBars.map((bar) => {
                const h = bar.minutes === 0 ? 8 : bar.percent
                return (
                  <div
                    key={`streak-${bar.label}`}
                    className="flex-1 rounded-t bg-aqua/25"
                    style={{ height: `${h}%` }}
                  />
                )
              })}
            </div>
            <p className="text-xs text-secondary">
              {streakDays > 0 ?
                `Você está com ${streakLabel} de ofensiva. Continue estudando para manter o ritmo.`
              : 'Complete um pomodoro em uma sala para iniciar sua ofensiva.'}
            </p>
          </div>
        </GlowLockedOverlay>
      </motion.section>

      <motion.section
        variants={item}
        className="mt-6 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 className="text-sm font-medium text-primary">Heatmap de constância</h2>
        <p className="mt-2 text-sm text-secondary">
          Intensidade de foco por dia nas últimas semanas.
        </p>
        <GlowLockedOverlay className="mt-6">
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${HEATMAP_DAYS}, minmax(0, 1fr))`,
            }}
          >
            {heatmapCells.map((cell) => (
              <div
                key={cell.dateKey}
                className="aspect-square rounded-sm"
                style={{ backgroundColor: heatmapColor(cell.intensity) }}
                title={cell.dateKey}
              />
            ))}
          </div>
        </GlowLockedOverlay>
      </motion.section>

      <motion.section variants={item} className="mt-6">
        <FocusPatterns />
      </motion.section>

      <motion.section variants={item} className="mt-6">
        <EvolutionTrails />
      </motion.section>
    </motion.div>
  )
}
