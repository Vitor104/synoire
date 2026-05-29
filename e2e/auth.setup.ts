import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { ensurePainelReady, requireTestEnv } from './helpers'

const authFile = path.join('playwright', '.auth', 'user.json')

setup('authenticate', async ({ page }) => {
  const email = requireTestEnv('VITE_TEST_EMAIL')
  const password = requireTestEnv('VITE_TEST_PASSWORD')

  await page.goto('/entrar')
  await page.getByRole('tab', { name: 'Entrar' }).click()
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/painel/, { timeout: 30_000 })
  await ensurePainelReady(page, { navigate: false })

  await mkdir(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
