import { describe, expect, it } from 'vitest'
import { formatRoomDisplayTitle } from './formatRoomDisplayTitle'

describe('formatRoomDisplayTitle', () => {
  it('uses study name when available', () => {
    expect(formatRoomDisplayTitle('ready', 'Direito • 25/5', 'uuid')).toBe('Direito • 25/5')
  })

  it('never formats uuid as title', () => {
    const uuid = '6ee79573-9eb4-4acf-8aee-dce2ff98379d'
    expect(formatRoomDisplayTitle('loading', null, uuid)).toBe('Carregando sala…')
    expect(formatRoomDisplayTitle('denied_private', null, uuid)).toBe('Sala privada')
    expect(formatRoomDisplayTitle('default', null, uuid)).toBe('Sala de estudo')
    expect(formatRoomDisplayTitle('ready', null, uuid)).toBe('Sala de estudo')
  })

  it('maps entry states', () => {
    expect(formatRoomDisplayTitle('not_found')).toBe('Sala não encontrada')
    expect(formatRoomDisplayTitle('error')).toBe('Não foi possível abrir a sala')
  })
})
