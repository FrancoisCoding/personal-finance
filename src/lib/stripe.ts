import Stripe from 'stripe'

const normalizeStripeEnvValue = (value: string | undefined) => {
  const trimmedValue = value?.trim() ?? ''
  if (!trimmedValue) {
    return ''
  }

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1).trim()
  }

  return trimmedValue
}

const stripeSecretKey = normalizeStripeEnvValue(process.env.STRIPE_SECRET_KEY)

export const stripeClient = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  : null
