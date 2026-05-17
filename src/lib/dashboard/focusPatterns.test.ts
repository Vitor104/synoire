import { describe, expect, it } from 'vitest'
import {
  aggregateByTimeBlock,
  generateMockSessions,
  getTimeBlock,
  TIME_BLOCK_LABELS,
} from './focusPatterns'

describe('getTimeBlock', () => {
  it('maps morning hours to manha', () => {
    expect(getTimeBlock(new Date(2026, 4, 17, 7, 30))).toBe('manha')
  })

  it('maps early morning to madrugada', () => {
    expect(getTimeBlock(new Date(2026, 4, 17, 2, 0))).toBe('madrugada')
  })

  it('maps afternoon to tarde', () => {
    expect(getTimeBlock(new Date(2026, 4, 17, 14, 0))).toBe('tarde')
  })

  it('maps evening to noite', () => {
    expect(getTimeBlock(new Date(2026, 4, 17, 20, 0))).toBe('noite')
  })
})

describe('aggregateByTimeBlock', () => {
  it('identifies peak block and matches insight label', () => {
    const sessions = [
      { startedAt: new Date(2026, 4, 17, 8, 0), durationMinutes: 120 },
      { startedAt: new Date(2026, 4, 17, 9, 0), durationMinutes: 60 },
      { startedAt: new Date(2026, 4, 17, 14, 0), durationMinutes: 30 },
    ]
    const stats = aggregateByTimeBlock(sessions)
    const peakEntry = stats.chartData.find((d) => d.block === stats.peakBlock)
    const maxMinutes = Math.max(...stats.chartData.map((d) => d.minutes))

    expect(stats.peakBlock).toBe('manha')
    expect(stats.peakLabel).toBe(TIME_BLOCK_LABELS.manha)
    expect(peakEntry?.minutes).toBe(180)
    expect(peakEntry?.minutes).toBe(maxMinutes)
  })

  it('computes boost percent vs average of other blocks', () => {
    const sessions = [
      { startedAt: new Date(2026, 4, 17, 8, 0), durationMinutes: 300 },
      { startedAt: new Date(2026, 4, 17, 14, 0), durationMinutes: 100 },
      { startedAt: new Date(2026, 4, 17, 20, 0), durationMinutes: 100 },
      { startedAt: new Date(2026, 4, 17, 2, 0), durationMinutes: 100 },
    ]
    const stats = aggregateByTimeBlock(sessions)
    const avgOthers = (100 + 100 + 100) / 3
    const expected = Math.round(((300 - avgOthers) / avgOthers) * 100)

    expect(stats.boostPercent).toBe(expected)
  })
})

describe('generateMockSessions', () => {
  it('returns stable seeded data', () => {
    const a = generateMockSessions()
    const b = generateMockSessions()
    expect(a.length).toBe(b.length)
    expect(a[0]?.durationMinutes).toBe(b[0]?.durationMinutes)
  })
})
