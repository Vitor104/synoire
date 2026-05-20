import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export type CreateGlowCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

export async function createGlowCheckout(): Promise<CreateGlowCheckoutResult> {
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
    return { ok: false, message: 'Faça login para assinar o Glow.' }
  }

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    method: 'POST',
    body: {
      user_id: session.user.id,
      email: session.user.email,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (error) {
    return {
      ok: false,
      message: error.message || 'Não foi possível iniciar o pagamento.',
    }
  }

  const url =
    typeof data === 'object' && data !== null && 'url' in data ?
      String((data as { url: unknown }).url)
    : null

  if (!url) {
    return { ok: false, message: 'Resposta inválida do servidor de pagamento.' }
  }

  return { ok: true, url }
}
