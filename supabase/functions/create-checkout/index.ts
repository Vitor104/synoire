import { createClient } from 'npm:@supabase/supabase-js@2.49.1'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=denonext'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { normalizeFrontendUrl } from '../_shared/frontendUrl.ts'

type CheckoutBody = {
  user_id?: string
  email?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
  const stripePriceId = Deno.env.get('STRIPE_PRICE_ID')
  let baseUrl: string
  try {
    baseUrl = normalizeFrontendUrl(Deno.env.get('FRONTEND_URL'))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid FRONTEND_URL'
    console.error(message)
    return jsonResponse({ error: 'Invalid FRONTEND_URL configuration' }, 500)
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!stripeSecret || !stripePriceId || !supabaseUrl || !supabaseAnonKey) {
    console.error('Missing server configuration')
    return jsonResponse({ error: 'Server configuration error' }, 500)
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

  let body: CheckoutBody = {}
  try {
    body = (await req.json()) as CheckoutBody
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  if (body.user_id && body.user_id !== user.id) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  const email = (body.email ?? user.email)?.trim()
  if (!email) {
    return jsonResponse({ error: 'Email is required' }, 400)
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

  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  let customerId = profile?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to save stripe_customer_id', updateError.message)
      return jsonResponse({ error: 'Could not save customer' }, 500)
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/painel?payment=success`,
      cancel_url: `${baseUrl}/painel?payment=cancelled`,
      metadata: { supabase_user_id: user.id },
    })

    if (!session.url) {
      return jsonResponse({ error: 'Checkout session has no URL' }, 500)
    }

    return jsonResponse({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed'
    console.error('checkout.sessions.create failed', message)
    return jsonResponse({ error: 'Could not create checkout session' }, 500)
  }
})
