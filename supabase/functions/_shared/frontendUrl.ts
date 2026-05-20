const DEFAULT_FRONTEND_URL = 'http://localhost:5173'

/**
 * Normaliza FRONTEND_URL para URLs aceitas pelo Stripe Checkout.
 * Corrige: vazio, aspas, falta de protocolo (localhost:5173 → http://...).
 */
export function normalizeFrontendUrl(raw: string | undefined): string {
  let value = (raw ?? '').trim()
  if (!value) return DEFAULT_FRONTEND_URL

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }

  if (!value) return DEFAULT_FRONTEND_URL

  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`
  }

  const url = new URL(value)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Invalid FRONTEND_URL protocol: ${url.protocol}`)
  }

  return `${url.protocol}//${url.host}`
}
