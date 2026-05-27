import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HubView } from '@/lib/hubs/types'
import { useHubEntry } from './useHubEntry'

const getHubBySlugMock = vi.fn()
const canJoinHubMock = vi.fn()
const redeemHubInviteTokenMock = vi.fn()
const resolveHubInviteTargetMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'guest-1' },
  }),
}))

vi.mock('@/lib/hubs/getHubBySlug', () => ({
  getHubBySlug: (...args: unknown[]) => getHubBySlugMock(...args),
}))

vi.mock('@/lib/hubs/canJoinHub', () => ({
  canJoinHub: (...args: unknown[]) => canJoinHubMock(...args),
}))

vi.mock('@/lib/hubAccess/hubInviteTokens', () => ({
  redeemHubInviteToken: (...args: unknown[]) => redeemHubInviteTokenMock(...args),
  resolveHubInviteTarget: (...args: unknown[]) => resolveHubInviteTargetMock(...args),
}))

function createWrapper(path: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  }
}

const privateHub: HubView = {
  id: 'hub-1',
  slug: 'privado-pf',
  name: 'Mentoria PF',
  shortLabel: 'Privado',
  accentStripe: 'bg-firefly',
  accentBadge: 'border-firefly',
  isPrivate: true,
  creatorId: 'creator-1',
}

describe('useHubEntry invite links', () => {
  beforeEach(() => {
    getHubBySlugMock.mockReset()
    canJoinHubMock.mockReset()
    redeemHubInviteTokenMock.mockReset()
    resolveHubInviteTargetMock.mockReset()
  })

  it('redeems a valid invite even when slug lookup is not used first', async () => {
    resolveHubInviteTargetMock.mockResolvedValue({
      ok: true,
      data: privateHub,
    })
    redeemHubInviteTokenMock.mockResolvedValue({ ok: true, data: true })
    canJoinHubMock.mockResolvedValue({ status: 'allowed' })

    const { result } = renderHook(() => useHubEntry('privado-pf'), {
      wrapper: createWrapper('/hubs/privado-pf?invite=token-123'),
    })

    await waitFor(() => {
      expect(result.current.entryStatus).toBe('ready')
    })

    expect(resolveHubInviteTargetMock).toHaveBeenCalledWith('privado-pf', 'token-123')
    expect(getHubBySlugMock).not.toHaveBeenCalled()
    expect(redeemHubInviteTokenMock).toHaveBeenCalledWith(
      'hub-1',
      'privado-pf',
      'token-123',
      'guest-1',
    )
    expect(canJoinHubMock).toHaveBeenCalledWith('privado-pf', 'guest-1')
    expect(result.current.hub?.id).toBe('hub-1')
  })

  it('returns invalid_invite when the token cannot resolve the private hub', async () => {
    resolveHubInviteTargetMock.mockResolvedValue({
      ok: true,
      data: null,
    })

    const { result } = renderHook(() => useHubEntry('privado-pf'), {
      wrapper: createWrapper('/hubs/privado-pf?invite=expired-token'),
    })

    await waitFor(() => {
      expect(result.current.entryStatus).toBe('invalid_invite')
    })

    expect(redeemHubInviteTokenMock).not.toHaveBeenCalled()
    expect(canJoinHubMock).not.toHaveBeenCalled()
    expect(result.current.entryMessage).toBe('Link de convite inválido ou expirado.')
  })
})
