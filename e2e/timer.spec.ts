import { test, expect } from '@playwright/test'
import { ensurePainelReady, readTodayStudyMinutes } from './helpers'

test('completa ciclo foco → pausa → foco e registra tempo de estudo', async ({ page }) => {
  test.setTimeout(60_000)

  await ensurePainelReady(page)

  const initialTodayMinutes = await readTodayStudyMinutes(page)

  await page.getByRole('link', { name: 'Hubs' }).click()
  await expect(page).toHaveURL(/\/hubs/)

  const hubLink = page.getByRole('link', { name: /receita federal/i }).first()
  await expect(hubLink).toBeVisible({ timeout: 15_000 })
  await hubLink.click()

  await expect(page).toHaveURL(/\/hubs\/receita(%20|\s)federal/i, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: /salas ativas/i }),
  ).toBeVisible({ timeout: 15_000 })

  const publicRoomLink = page.getByRole('link', {
    name: /^Entrar na sala (?!privada\b)/,
  })
  // Requer sala pública visível no hub Receita Federal (< 24h vazia).
  await expect(publicRoomLink.first()).toBeVisible({ timeout: 15_000 })
  await publicRoomLink.first().click()

  await expect(page).toHaveURL(/\/salas\//, { timeout: 15_000 })

  await page.evaluate(() => {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('synoire-study-session:')) {
        sessionStorage.removeItem(key)
      }
    }
  })

  const onboarding = page.getByRole('dialog', { name: /onboarding da sessão/i })
  await expect(onboarding).toBeVisible({ timeout: 15_000 })

  const studyRecordDone = page.waitForResponse(
    (res) =>
      res.url().includes('record_study_time') && res.request().method() === 'POST',
    { timeout: 30_000 },
  )

  await page.getByRole('button', { name: 'Entrar no ciclo atual' }).click()
  await expect(onboarding).toBeHidden({ timeout: 10_000 })

  await expect(page.getByText(/sessão de foco/i)).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/pausa curta/i)).toBeVisible({ timeout: 15_000 })
  await studyRecordDone
  await expect(page.getByText(/sessão de foco/i)).toBeVisible({ timeout: 15_000 })

  await ensurePainelReady(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: /painel/i })).toBeVisible({ timeout: 15_000 })

  await expect.poll(
    async () => {
      const minutes = await readTodayStudyMinutes(page)
      return minutes >= initialTodayMinutes + 25
    },
    {
      timeout: 30_000,
      message: 'Horas estudadas hoje devem incluir +25 min após o ciclo de foco',
    },
  ).toBe(true)
})
