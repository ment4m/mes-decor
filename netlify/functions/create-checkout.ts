import Stripe from 'stripe'
import type { Handler } from '@netlify/functions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

interface LineItem {
  name:       string
  amountCents: number  // unit amount in cents
  quantity:   number
}

interface CheckoutBody {
  items:       LineItem[]
  paymentType: 'full' | 'deposit'
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { items, paymentType }: CheckoutBody = JSON.parse(event.body ?? '{}')
    if (!items?.length) return { statusCode: 400, body: 'Invalid request' }

    const isDeposit = paymentType === 'deposit'

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((i) => ({
      price_data: {
        currency:     'usd',
        unit_amount:  isDeposit ? Math.round(i.amountCents * 0.5) : i.amountCents,
        product_data: {
          name: isDeposit ? `${i.name} – 50% Deposit` : i.name,
        },
      },
      quantity: i.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:   lineItems,
      mode:         'payment',
      success_url:  `${event.headers.origin}/payment-success`,
      cancel_url:   `${event.headers.origin}/#rentals`,
    })

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: 'Internal Server Error' }
  }
}
