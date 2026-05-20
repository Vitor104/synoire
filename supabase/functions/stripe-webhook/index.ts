import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing webhook configuration')
    return new Response('Server configuration error', { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const rawBody = await req.text()
  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Webhook signature verification failed', message)
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId =
          session.client_reference_id ??
          session.metadata?.supabase_user_id ??
          null

        if (!userId) {
          console.error('checkout.session.completed: missing user id')
          break
        }

        const customerId =
          typeof session.customer === 'string' ?
            session.customer
          : session.customer?.id ?? null

        const subscriptionId =
          typeof session.subscription === 'string' ?
            session.subscription
          : session.subscription?.id ?? null

        const { error } = await admin
          .from('profiles')
          .update({
            plan_tier: 'glow',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          })
          .eq('id', userId)

        if (error) {
          console.error('Failed to activate glow', error.message)
          return new Response('Database update failed', { status: 500 })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id
        const customerId =
          typeof subscription.customer === 'string' ?
            subscription.customer
          : subscription.customer?.id ?? null

        let query = admin
          .from('profiles')
          .update({
            plan_tier: 'free',
            subscription_status: 'canceled',
          })

        if (subscriptionId) {
          query = query.eq('stripe_subscription_id', subscriptionId)
        } else if (customerId) {
          query = query.eq('stripe_customer_id', customerId)
        } else {
          console.error('subscription.deleted: no ids to match')
          break
        }

        const { error } = await query
        if (error) {
          console.error('Failed to cancel subscription', error.message)
          return new Response('Database update failed', { status: 500 })
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Webhook handler error', err)
    return new Response('Webhook handler failed', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
