import { createClient } from 'npm:@supabase/supabase-js@2.49.1'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=denonext'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { normalizeFrontendUrl } from '../_shared/frontendUrl.ts'

const PROFILE_RETURN_PATH = '/perfil'

function buildReturnUrl(req: Request): string {
  const origin = req.headers.get('origin')?.trim()
  if (origin) {
    try {
      const url = new URL(origin)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return `${url.protocol}//${url.host}${PROFILE_RETURN_PATH}`
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid origin header'
      console.warn('Invalid origin header', message)
    }
  }

  const fallbackBaseUrl = normalizeFrontendUrl(Deno.env.get('FRONTEND_URL'))
  return `${fallbackBaseUrl}${PROFILE_RETURN_PATH}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!stripeSecret || !supabaseUrl || !supabaseAnonKey) {
    console.error('Missing server configuration')
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let returnUrl: string
  try {
    returnUrl = buildReturnUrl(req)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid return URL'
    console.error('Could not build portal return URL', message)
    return jsonResponse({ error: 'Invalid FRONTEND_URL configuration' }, 500)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Profile lookup failed', profileError.message)
    return jsonResponse({ error: 'Could not load profile' }, 500)
  }

  const customerId = profile?.stripe_customer_id?.trim() ?? ''
  if (!customerId) {
    return jsonResponse({ error: 'No Stripe customer found for this user' }, 400)
  }

  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    if (!session.url) {
      return jsonResponse({ error: 'Portal session has no URL' }, 500)
    }

    return jsonResponse({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe portal failed'
    console.error('billingPortal.sessions.create failed', message)
    return jsonResponse({ error: 'Could not create portal session' }, 500)
  }
})
