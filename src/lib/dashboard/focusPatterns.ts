import { hourInTz, STUDY_TIMEZONE } from '@/lib/dashboard/studyAnalytics'

export type StudySessionPoint = {
  startedAt: Date
  durationMinutes: number
}

export type TimeBlock = 'madrugada' | 'manha' | 'tarde' | 'noite'

export const TIME_BLOCKS: readonly TimeBlock[] = [
  'madrugada',
  'manha',
  'tarde',
  'noite',
] as const

export const TIME_BLOCK_LABELS: Record<TimeBlock, string> = {
  madrugada: 'Madrugada',
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
}

export function getTimeBlock(
  date: Date,
  timeZone: string = STUDY_TIMEZONE,
): TimeBlock {
  const hour = hourInTz(date, timeZone)
  if (hour >= 6 && hour <= 11) return 'manha'
  if (hour >= 12 && hour <= 17) return 'tarde'
  if (hour >= 18 && hour <= 23) return 'noite'
  return 'madrugada'
}

export type TimeBlockAggregate = {
  block: TimeBlock
  label: string
  minutes: number
}

export type FocusPatternsStats = {
  chartData: TimeBlockAggregate[]
  peakBlock: TimeBlock
  peakLabel: string
  boostPercent: number
}

export function aggregateByTimeBlock(sessions: StudySessionPoint[]): FocusPatternsStats {
  const minutesByBlock: Record<TimeBlock, number> = {
    madrugada: 0,
    manha: 0,
    tarde: 0,
    noite: 0,
  }

  for (const session of sessions) {
    const block = getTimeBlock(session.startedAt)
    minutesByBlock[block] += session.durationMinutes
  }

  const chartData: TimeBlockAggregate[] = TIME_BLOCKS.map((block) => ({
    block,
    label: TIME_BLOCK_LABELS[block],
    minutes: minutesByBlock[block],
  }))

  let peakBlock: TimeBlock = 'manha'
  let peakMinutes = -1
  for (const block of TIME_BLOCKS) {
    if (minutesByBlock[block] > peakMinutes) {
      peakMinutes = minutesByBlock[block]
      peakBlock = block
    }
  }

  const others = TIME_BLOCKS.filter((b) => b !== peakBlock).map((b) => minutesByBlock[b])
  const avgOthers = others.reduce((a, b) => a + b, 0) / others.length
  const boostPercent =
    avgOthers > 0 ? Math.round(((peakMinutes - avgOthers) / avgOthers) * 100) : 0

  return {
    chartData,
    peakBlock,
    peakLabel: TIME_BLOCK_LABELS[peakBlock],
    boostPercent,
  }
}
