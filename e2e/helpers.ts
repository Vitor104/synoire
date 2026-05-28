import { expect, type Page } from '@playwright/test'

function painelHeading(page: Page) {
  return page.getByRole('heading', { name: /painel/i })
}

async function completeOnboardingIfNeeded(page: Page) {
  const welcomeDialog = page.getByRole('dialog', { name: /bem-vindo ao synoire/i })
  if (await welcomeDialog.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Definir minha Meta' }).click()
    await expect(
      page.getByRole('heading', { name: /qual é o seu objetivo/i }),
    ).toBeVisible({ timeout: 15_000 })
  }

  const goalHeading = page.getByRole('heading', { name: /qual é o seu objetivo/i })
  const hoursInput = page.getByLabel('Horas por semana')
  const goalFormVisible =
    (await goalHeading.isVisible().catch(() => false)) ||
    (await hoursInput.isVisible().catch(() => false))

  if (goalFormVisible) {
    await page.getByRole('button', { name: 'Salvar e Começar' }).click()
  }

  await expect.poll(
    async () => painelHeading(page).isVisible(),
    { timeout: 15_000 },
  ).toBe(true)
}

/** Navigates to /painel (optional), completes onboarding, and waits until the dashboard is interactive. */
export async function ensurePainelReady(
  page: Page,
  options: { navigate?: boolean } = {},
) {
  const { navigate = true } = options
  if (navigate) {
    await page.goto('/painel')
  }
  await expect(page).toHaveURL(/\/painel/, { timeout: 30_000 })
  await completeOnboardingIfNeeded(page)
  await expect(painelHeading(page)).toBeVisible({ timeout: 15_000 })
}

/** Completes welcome/goal modals without navigation. Prefer ensurePainelReady when asserting the dashboard. */
export async function dismissOnboardingIfPresent(page: Page) {
  await completeOnboardingIfNeeded(page)
}

/** Parses dashboard "Hoje" metric (e.g. "0h", "25min", "1.5h") to minutes. */
export async function readTodayStudyMinutes(page: Page): Promise<number> {
  const todaySection = page.locator('div').filter({ has: page.getByText('Hoje', { exact: true }) })
  const valueText = await todaySection.locator('.tabular-nums').first().textContent()
  const raw = (valueText ?? '0h').trim().toLowerCase()
  if (raw.endsWith('min')) {
    return Number.parseInt(raw, 10) || 0
  }
  if (raw.endsWith('h')) {
    const hours = Number.parseFloat(raw.replace('h', ''))
    return Number.isFinite(hours) ? Math.round(hours * 60) : 0
  }
  return 0
}
