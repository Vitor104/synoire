import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitHubRequest } from './submitHubRequest'

const singleMock = vi.fn()
const selectMock = vi.fn()
const insertMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    from: fromMock,
  }),
}))

describe('submitHubRequest', () => {
  beforeEach(() => {
    singleMock.mockReset()
    selectMock.mockReset()
    insertMock.mockReset()
    fromMock.mockReset()
    selectMock.mockReturnValue({ single: singleMock })
    insertMock.mockReturnValue({ select: selectMock })
    fromMock.mockReturnValue({ insert: insertMock })
  })

  it('inserts hub request with user id and trimmed name', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'req-1',
        user_id: 'u1',
        requested_name: 'Tribunal de Justiça de SP',
        status: 'pending',
        created_at: '2026-05-18T00:00:00Z',
      },
      error: null,
    })

    const row = await submitHubRequest('u1', '  Tribunal de Justiça de SP  ')

    expect(fromMock).toHaveBeenCalledWith('hub_requests')
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'u1',
      requested_name: 'Tribunal de Justiça de SP',
    })
    expect(selectMock).toHaveBeenCalled()
    expect(row.status).toBe('pending')
    expect(row.requested_name).toBe('Tribunal de Justiça de SP')
  })

  it('rejects empty user id', async () => {
    await expect(submitHubRequest('', 'Tribunal de Justiça de SP')).rejects.toThrow(
      'Entre na sua conta para enviar uma sugestão.',
    )
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('rejects invalid names before calling supabase', async () => {
    await expect(submitHubRequest('u1', 'A')).rejects.toThrow('Mínimo de 2 caracteres.')
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('maps jwt errors to login message', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: 'JWT expired' },
    })

    await expect(submitHubRequest('u1', 'Tribunal de Justiça de SP')).rejects.toThrow(
      'Entre na sua conta para enviar uma sugestão.',
    )
  })

  it('maps name length constraint errors', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: 'new row violates check constraint hub_requests_name_length' },
    })

    await expect(submitHubRequest('u1', 'Tribunal de Justiça de SP')).rejects.toThrow(
      'O nome deve ter entre 2 e 120 caracteres.',
    )
  })

  it('maps generic insert errors', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: 'something went wrong' },
    })

    await expect(submitHubRequest('u1', 'Tribunal de Justiça de SP')).rejects.toThrow(
      'Não foi possível enviar a sugestão. Tente novamente.',
    )
  })
})
