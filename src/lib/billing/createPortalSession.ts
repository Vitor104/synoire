import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export type CreatePortalSessionResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

async function resolveFunctionErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  const context =
    typeof error === 'object' && error !== null && 'context' in error ?
      (error as { context?: unknown }).context
    : null

  if (context instanceof Response) {
    try {
      const payload = (await context.clone().json()) as { error?: unknown }
      if (typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error
      }
    } catch {
      // Ignore invalid JSON bodies and fall back to the SDK error message.
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export async function createPortalSession(): Promise<CreatePortalSessionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase não está configurado.' }
  }

  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, message: 'Supabase não está configurado.' }
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    return { ok: false, message: 'Faça login para gerenciar sua assinatura.' }
  }

  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (error) {
    return {
      ok: false,
      message: await resolveFunctionErrorMessage(
        error,
        'Não foi possível abrir o portal de assinatura.',
      ),
    }
  }

  const url =
    typeof data === 'object' && data !== null && 'url' in data ?
      String((data as { url: unknown }).url)
    : null

  if (!url) {
    return { ok: false, message: 'Resposta inválida do portal de assinatura.' }
  }

  return { ok: true, url }
}
