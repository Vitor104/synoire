import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { WeeklyGoalGate } from './WeeklyGoalGate'

vi.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => true,
}))

const saveWeeklyGoal = vi.fn(async () => ({ ok: true as const }))

vi.mock('@/hooks/useUserStats', () => ({
  useUserStats: () => ({
    stats: { currentStreak: 0, totalHours: 0, weeklyGoalMinutes: 0 },
    isLoading: false,
    error: null,
    isSaving: false,
    refresh: vi.fn(),
    saveWeeklyGoal,
  }),
}))

function HubsStub() {
  return <h1>Hubs por concurso</h1>
}

function PainelStub() {
  return <h1>Painel</h1>
}

describe('WeeklyGoalGate', () => {
  it('mantém /hubs sem redirecionar ao painel quando onboarding pendente', () => {
    render(
      <MemoryRouter initialEntries={['/hubs']}>
        <Routes>
          <Route element={<WeeklyGoalGate />}>
            <Route path="/hubs" element={<HubsStub />} />
            <Route path="/painel" element={<PainelStub />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /hubs por concurso/i, hidden: true }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/^painel$/i)).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /qual é o seu objetivo/i })).toBeInTheDocument()
  })
})
