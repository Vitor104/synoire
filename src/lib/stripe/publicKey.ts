import { loadStripe, type Stripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

export const isStripeConfigured = Boolean(publishableKey?.trim())

let stripePromise: Promise<Stripe | null> | null = null

/** Pré-carrega o SDK Stripe (Checkout hospedado usa redirect por URL). */
export function getStripe(): Promise<Stripe | null> | null {
  if (!isStripeConfigured) return null
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey!)
  }
  return stripePromise
}
