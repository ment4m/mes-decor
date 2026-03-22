import Stripe from 'stripe'
import type { Handler } from '@netlify/functions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

interface CheckoutBody {
  item:        'serpentine-table' | 'chiavari-chairs' | 'grad-marquee'
  paymentType: 'full' | 'deposit'
  quantity:    number
  deliveryFee?: number  // in dollars, 0 = pickup
}

const ITEMS = {
  'serpentine-table': { name: 'Serpentine Table',     fullPrice: 30000, depositPrice: 15000, maxQty: 1  },
  'chiavari-chairs':  { name: 'Chiavari Chairs',      fullPrice:   500, depositPrice:   250, maxQty: 40 },
  'grad-marquee':     { name: 'Grad Marquee Letters', fullPrice: 20000, depositPrice: 10000, maxQty: 1  },
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { item, paymentType, quantity = 1, deliveryFee = 0 }: CheckoutBody = JSON.parse(event.body ?? '{}')
    const product = ITEMS[item]
    if (!product) return { statusCode: 400, body: 'Invalid item' }

    const unitAmount = paymentType === 'full' ? product.fullPrice : product.depositPrice
    const qty        = Math.min(Math.max(1, quantity), product.maxQty)

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency:     'usd',
          unit_amount:  unitAmount,
          product_data: {
            name: paymentType === 'deposit'
              ? `${product.name} – 50% Deposit`
              : product.name,
          },
        },
        quantity: qty,
      },
    ]

    // Add delivery fee as separate line item if applicable
    if (deliveryFee > 0) {
      const deliveryAmountCents = paymentType === 'deposit'
        ? Math.round(deliveryFee * 100 * 0.5)
        : Math.round(deliveryFee * 100)

      lineItems.push({
        price_data: {
          currency:     'usd',
          unit_amount:  deliveryAmountCents,
          product_data: {
            name: paymentType === 'deposit' ? 'Delivery Fee – 50%' : 'Delivery Fee',
          },
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:   lineItems,
      mode:         'payment',
      success_url:  `${event.headers.origin}/payment-success`,
      cancel_url:   `${event.headers.origin}/#rentals`,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: 'Internal Server Error' }
  }
}
