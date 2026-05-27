const DEFAULT_FRONTEND_URL = 'http://localhost:5173'

type NormalizeUrlOptions = {
  allowLocalhostDefault?: boolean
  label?: string
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim()
  }

  return value
}

function normalizeHttpUrl(raw: string, label: string): string {
  let value = stripQuotes(raw.trim())

  if (!value) {
    throw new Error(`Missing ${label} configuration`)
  }

  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`
  }

  const url = new URL(value)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Invalid ${label} protocol: ${url.protocol}`)
  }

  return `${url.protocol}//${url.host}`
}

function isLocalSupabaseRuntime(): boolean {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() ?? ''
  return /localhost|127\.0\.0\.1/i.test(supabaseUrl)
}

/**
 * Normaliza FRONTEND_URL para URLs aceitas pelo Stripe Checkout.
 * Corrige: aspas e falta de protocolo (localhost:5173 → http://...).
 */
export function normalizeFrontendUrl(
  raw: string | undefined,
  options: NormalizeUrlOptions = {},
): string {
  const label = options.label ?? 'FRONTEND_URL'
  const value = stripQuotes((raw ?? '').trim())

  if (!value) {
    if (options.allowLocalhostDefault && isLocalSupabaseRuntime()) {
      return DEFAULT_FRONTEND_URL
    }

    throw new Error(`Missing ${label} configuration`)
  }

  return normalizeHttpUrl(value, label)
}

export function resolveFrontendBaseUrl(req: Request): string {
  const origin = req.headers.get('origin')?.trim()
  if (origin) {
    try {
      return normalizeHttpUrl(origin, 'Origin header')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid origin header'
      console.warn('Invalid origin header', message)
    }
  }

  return normalizeFrontendUrl(Deno.env.get('FRONTEND_URL'), {
    allowLocalhostDefault: true,
  })
}
