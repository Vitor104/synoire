import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'

const authFile = path.join('playwright', '.auth', 'user.json')

function requireEnv(name: 'VITE_TEST_EMAIL' | 'VITE_TEST_PASSWORD'): string {
  const value = process.env[name]
  if (!value?.trim()) {
    throw new Error(
      `Defina ${name} no .env ou .env.local (veja .env.example) para os testes E2E.`,
    )
  }
  return value
}

async function dismissOnboardingIfPresent(page: import('@playwright/test').Page) {
  const welcomeDialog = page.getByRole('dialog', { name: /bem-vindo ao synoire/i })
  if (await welcomeDialog.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Definir minha Meta' }).click()
  }

  const goalDialog = page.getByRole('dialog').filter({
    has: page.getByRole('heading', { name: /qual é o seu objetivo/i }),
  })
  const goalVisible = await goalDialog.isVisible().catch(() => false)
  const onboardingGoalModal = page
    .getByRole('dialog')
    .filter({ has: page.getByLabel('Horas por semana') })

  if (goalVisible || (await onboardingGoalModal.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Salvar e Começar' }).click()
    await expect(
      page.getByRole('dialog', { name: /bem-vindo ao synoire/i }),
    ).toBeHidden({ timeout: 15_000 })
    await expect(onboardingGoalModal).toBeHidden({ timeout: 15_000 }).catch(() => {})
  }
}

setup('authenticate', async ({ page }) => {
  const email = requireEnv('VITE_TEST_EMAIL')
  const password = requireEnv('VITE_TEST_PASSWORD')

  await page.goto('/entrar')
  await page.getByRole('tab', { name: 'Entrar' }).click()
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/painel/, { timeout: 30_000 })
  await dismissOnboardingIfPresent(page)

  await mkdir(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
