import { beforeEach, describe, expect, it } from 'vitest'
import {
  consumeBillingReturnFlash,
  writeBillingReturnFlash,
} from './billingReturnFlash'

describe('billingReturnFlash', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('persiste a mensagem e consome apenas uma vez', () => {
    writeBillingReturnFlash('Pagamento confirmado.')

    expect(consumeBillingReturnFlash()).toBe('Pagamento confirmado.')
    expect(consumeBillingReturnFlash()).toBeNull()
  })

  it('ignora mensagens vazias', () => {
    writeBillingReturnFlash('   ')

    expect(consumeBillingReturnFlash()).toBeNull()
  })
})
