import { test, expect } from '@playwright/test'
import { ensurePainelReady } from './helpers'

test('deve carregar o dashboard e exibir a lista de Hubs', async ({ page }) => {
  await ensurePainelReady(page)

  await expect(page.getByText('Hoje')).toBeVisible()
  await expect(page.getByText('Meta semanal')).toBeVisible()

  await page.getByRole('link', { name: 'Hubs' }).click()
  await expect(page).toHaveURL(/\/hubs/)

  await expect(
    page.getByRole('heading', { name: /hubs de estudo/i }),
  ).toBeVisible({ timeout: 15_000 })

  const hubCards = page.locator('article').filter({ has: page.locator('h2') })
  const createHubButton = page.getByRole('button', { name: /criar hub privado/i })

  await expect
    .poll(async () => {
      const cardCount = await hubCards.count()
      const hasCreate = await createHubButton.isVisible()
      return cardCount > 0 || hasCreate
    }, { timeout: 15_000 })
    .toBe(true)
})
