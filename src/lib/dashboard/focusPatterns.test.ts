import { describe, expect, it } from 'vitest'
import {
  aggregateByTimeBlock,
  getTimeBlock,
  TIME_BLOCK_LABELS,
} from './focusPatterns'

describe('getTimeBlock', () => {
  it('maps morning hours to manha in Sao Paulo', () => {
    expect(getTimeBlock(new Date('2026-05-17T10:00:00.000Z'))).toBe('manha')
  })

  it('maps early morning to madrugada in Sao Paulo', () => {
    expect(getTimeBlock(new Date('2026-05-17T05:00:00.000Z'))).toBe('madrugada')
  })

  it('maps afternoon to tarde in Sao Paulo', () => {
    expect(getTimeBlock(new Date('2026-05-17T17:00:00.000Z'))).toBe('tarde')
  })

  it('maps evening to noite in Sao Paulo', () => {
    expect(getTimeBlock(new Date('2026-05-17T23:00:00.000Z'))).toBe('noite')
  })
})

describe('aggregateByTimeBlock', () => {
  it('identifies peak block and matches insight label', () => {
    const sessions = [
      { startedAt: new Date('2026-05-17T10:00:00.000Z'), durationMinutes: 120 },
      { startedAt: new Date('2026-05-17T11:00:00.000Z'), durationMinutes: 60 },
      { startedAt: new Date('2026-05-17T17:00:00.000Z'), durationMinutes: 30 },
    ]
    const stats = aggregateByTimeBlock(sessions)
    const peakEntry = stats.chartData.find((d) => d.block === stats.peakBlock)
    const maxMinutes = Math.max(...stats.chartData.map((d) => d.minutes))

    expect(stats.peakBlock).toBe('manha')
    expect(stats.peakLabel).toBe(TIME_BLOCK_LABELS.manha)
    expect(peakEntry?.minutes).toBe(180)
    expect(peakEntry?.minutes).toBe(maxMinutes)
  })
})
