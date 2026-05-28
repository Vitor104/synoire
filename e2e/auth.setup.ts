import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { ensurePainelReady } from './helpers'

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

setup('authenticate', async ({ page }) => {
  const email = requireEnv('VITE_TEST_EMAIL')
  const password = requireEnv('VITE_TEST_PASSWORD')

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
