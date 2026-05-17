export type StudySessionMock = {
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

export function getTimeBlock(date: Date): TimeBlock {
  const hour = date.getHours()
  if (hour >= 6 && hour <= 11) return 'manha'
  if (hour >= 12 && hour <= 17) return 'tarde'
  if (hour >= 18 && hour <= 23) return 'noite'
  return 'madrugada'
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateMockSessions(): StudySessionMock[] {
  const rand = seededRandom(42)
  const sessions: StudySessionMock[] = []
  const now = new Date()
  const sessionCount = 40 + Math.floor(rand() * 41)

  for (let i = 0; i < sessionCount; i++) {
    const daysAgo = Math.floor(rand() * 30)
    const hour = Math.floor(rand() * 24)
    const minute = Math.floor(rand() * 60)
    const startedAt = new Date(now)
    startedAt.setDate(startedAt.getDate() - daysAgo)
    startedAt.setHours(hour, minute, 0, 0)

    const durationMinutes = 25 + Math.floor(rand() * 66)
    sessions.push({ startedAt, durationMinutes })
  }

  return sessions
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

export function aggregateByTimeBlock(sessions: StudySessionMock[]): FocusPatternsStats {
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
