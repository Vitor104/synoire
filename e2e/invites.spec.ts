import { test, expect, type Page } from '@playwright/test'
import {
  captureRoomInviteLink,
  createPrivateRoomInHub,
  e2eUniqueRoomTheme,
  ensurePainelReady,
  ensureStudyPartnersAccepted,
  expectPrivateRoomAccessible,
  openPartnersSidebar,
  openRoomInviteModal,
  requireTestEnv,
} from './helpers'

test.describe.configure({ mode: 'serial' })

/** Login user2 via /entrar (rota de auth do app). */
async function loginUser2(page2: Page, email: string, password: string) {
  await page2.goto('/entrar')
  await page2.getByRole('tab', { name: 'Entrar' }).click()
  await page2.getByLabel('E-mail').fill(email)
  await page2.getByLabel('Senha').fill(password)
  await page2.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page2).toHaveURL(/\/painel/, { timeout: 30_000 })
}

test.describe('convites de sala e RLS', () => {
  test('link de convite libera acesso à sala privada (redeem + RLS)', async ({
    browser,
    page,
  }) => {
    test.setTimeout(120_000)

    const user2Email = requireTestEnv('VITE_TEST_USER2_EMAIL')
    const user2Password = requireTestEnv('VITE_TEST_USER2_PASSWORD')

    const context2 = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const page2 = await context2.newPage()

    try {
      await ensurePainelReady(page)

      const roomTheme = e2eUniqueRoomTheme('link')
      const roomId = await createPrivateRoomInHub(page, /receita federal/i, roomTheme)

      await openRoomInviteModal(page)
      const inviteLink = await captureRoomInviteLink(page, roomId)
      await page.keyboard.press('Escape')

      await loginUser2(page2, user2Email, user2Password)
      await page2.goto(inviteLink)

      await expect(page2).toHaveURL(new RegExp(`/salas/${roomId}`), { timeout: 30_000 })
      await expect(page2.getByText(/peça um link de convite/i)).toBeHidden({ timeout: 10_000 })
      await expectPrivateRoomAccessible(page2)
    } finally {
      await context2.close()
    }
  })

  test('convite de parceiro e cooldown após aceite (grant + accept)', async ({
    browser,
    page,
  }) => {
    test.setTimeout(120_000)

    const user2Email = requireTestEnv('VITE_TEST_USER2_EMAIL')
    const user2Password = requireTestEnv('VITE_TEST_USER2_PASSWORD')
    const user2Username =
      process.env.VITE_TEST_USER2_USERNAME?.trim().replace(/^@/, '') ||
      user2Email.split('@')[0]?.trim() ||
      'teste2'

    const context2 = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    })
    const page2 = await context2.newPage()

    try {
      await loginUser2(page2, user2Email, user2Password)

      await ensurePainelReady(page)
      await ensureStudyPartnersAccepted(page, page2, user2Username)

      const roomTheme = e2eUniqueRoomTheme('grant')
      await createPrivateRoomInHub(page, /receita federal/i, roomTheme)

      await openRoomInviteModal(page)
      await page.waitForTimeout(2000)

      const inviteDialog = page.getByRole('dialog', { name: 'Convidar parceiros' })
      await expect(inviteDialog.getByText('Carregando convites…')).toBeHidden({
        timeout: 15_000,
      })

      const partnerRow = inviteDialog
        .getByRole('listitem')
        .filter({ hasText: new RegExp(user2Username, 'i') })
      await expect(partnerRow.first()).toBeVisible({ timeout: 15_000 })
      const partnerLabel = (
        (await partnerRow.first().locator('p').first().textContent()) ?? ''
      ).trim()

      await partnerRow.first().getByRole('button', { name: 'Enviar Convite' }).click()
      await page.waitForTimeout(2000)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(1000)

      await openPartnersSidebar(page2)
      await page2.waitForTimeout(2000)

      const roomInviteSection = page2.getByRole('dialog', { name: 'Parceiros de estudo' })
      const roomInviteRow = roomInviteSection.locator('li').filter({ hasText: roomTheme })
      await expect(roomInviteRow).toBeVisible({ timeout: 15_000 })

      await roomInviteRow.getByRole('button', { name: 'Entrar' }).click()
      await page2.waitForTimeout(2000)

      await expect(page2).toHaveURL(/\/salas\//, { timeout: 30_000 })
      await expectPrivateRoomAccessible(page2)

      await page.keyboard.press('Escape')
      await page.waitForTimeout(1000)
      await openRoomInviteModal(page)
      await page.waitForTimeout(2000)

      const inviteDialogAfter = page.getByRole('dialog', { name: 'Convidar parceiros' })
      await expect(inviteDialogAfter.getByText('Carregando convites…')).toBeHidden({
        timeout: 15_000,
      })

      const partnerRowAfter = inviteDialogAfter
        .getByRole('listitem')
        .filter({ hasText: partnerLabel })
      await expect(partnerRowAfter.first()).toBeVisible({ timeout: 15_000 })

      const aceitoBtn = partnerRowAfter.first().getByRole('button', { name: 'Aceito' })
      await expect(aceitoBtn).toBeVisible({ timeout: 15_000 })
      await expect(aceitoBtn).toBeDisabled()
    } finally {
      await context2.close()
    }
  })
})
