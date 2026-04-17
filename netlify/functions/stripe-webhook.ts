import Stripe from 'stripe'
import type { Handler } from '@netlify/functions'

const stripe        = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string
const resendKey     = process.env.RESEND_API_KEY as string
const adminEmail    = process.env.ADMIN_EMAIL as string
const airtableToken = process.env.VITE_AIRTABLE_TOKEN as string
const airtableBase  = process.env.VITE_AIRTABLE_BASE_ID as string
const airtableTable = process.env.VITE_AIRTABLE_TABLE_ID as string

async function createAirtableBooking(
  name: string, items: string, date: string, time: string, location: string, amount: string
): Promise<void> {
  await fetch(`https://api.airtable.com/v0/${airtableBase}/${airtableTable}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      fields: {
        Name:    name || 'Via Pay Link',
        Phone:   '',
        Service: items,
        Date:    date,
        Time:    time,
        Status:  'Reserved',
        Notes:   `Location: ${location} | Deposit paid: ${amount}`,
      },
    }),
  })
}

// Convert "2025-06-14" + "18:30" → "20250614T183000"
function toICSDate(date: string, time: string): string {
  const d = date.replace(/-/g, '')
  const t = time.replace(':', '') + '00'
  return `${d}T${t}`
}

// Build .ics file content
function buildICS(title: string, date: string, time: string, location: string, description: string): string {
  const start = toICSDate(date, time)
  // Default 3-hour event
  const endHour = String(Number(time.split(':')[0]) + 3).padStart(2, '0')
  const end = toICSDate(date, `${endHour}:${time.split(':')[1]}`)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mes Decor//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DTSTART;TZID=America/Chicago:${start}`,
    `DTEND;TZID=America/Chicago:${end}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

// Google Calendar quick-add link
function googleCalLink(title: string, date: string, time: string, location: string, details: string): string {
  const start = toICSDate(date, time)
  const endHour = String(Number(time.split(':')[0]) + 3).padStart(2, '0')
  const end = toICSDate(date, `${endHour}:${time.split(':')[1]}`)
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     title,
    dates:    `${start}/${end}`,
    ctz:      'America/Chicago',
    location,
    details,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  const sig = event.headers['stripe-signature']
  if (!sig) return { statusCode: 400, body: 'Missing signature' }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body ?? '', sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return { statusCode: 400, body: 'Invalid signature' }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session  = stripeEvent.data.object as Stripe.Checkout.Session
    const meta     = session.metadata ?? {}
    const amount   = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A'
    const items    = meta.items      || 'N/A'
    const date     = meta.date       || ''
    const time     = meta.time       || ''
    const location = meta.location   || 'N/A'
    const name     = meta.clientName || 'N/A'

    const title       = name !== 'N/A' ? `Mes Decor – ${name}` : `Mes Decor – ${items}`
    const description = `Client: ${name} | Payment: ${amount}`
    const subject     = `💰 New Booking – ${name !== 'N/A' ? name : items} on ${date}`

    // Format date nicely for email display
    const tz          = 'America/Chicago'
    const displayDate = date
      ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz })
      : 'N/A'
    const displayTime = time
      ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }) + ' CT'
      : 'N/A'

    const gcalLink = date && time ? googleCalLink(title, date, time, location, description) : ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:system-ui,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#c9a84c;padding:32px 32px 24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">💰</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">New Payment Received</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Mes Decor Booking</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">

      <!-- Amount pill -->
      <div style="text-align:center;margin-bottom:24px;">
        <span style="background:#f5f0e8;color:#c9a84c;font-size:28px;font-weight:700;padding:10px 28px;border-radius:999px;display:inline-block;">${amount}</span>
      </div>

      <!-- Client & Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:10px 14px;background:#f9f6ef;border-radius:8px 8px 0 0;font-size:12px;font-weight:700;color:#9a8a72;text-transform:uppercase;letter-spacing:0.05em;">Client</td>
          <td style="padding:10px 14px;background:#f9f6ef;border-radius:8px 8px 0 0;font-size:14px;font-weight:600;color:#1a1008;text-align:right;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:12px;font-weight:700;color:#9a8a72;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #ede8dc;">Items</td>
          <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#1a1008;text-align:right;border-top:1px solid #ede8dc;">${items}</td>
        </tr>
      </table>

      <!-- Event Details -->
      <div style="background:#f9f6ef;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#9a8a72;text-transform:uppercase;letter-spacing:0.05em;">Event Details</p>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="font-size:18px;">📅</span>
          <span style="font-size:14px;color:#1a1008;">${displayDate}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="font-size:18px;">🕐</span>
          <span style="font-size:14px;color:#1a1008;">${displayTime}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:18px;">📍</span>
          <span style="font-size:14px;color:#1a1008;">${location}</span>
        </div>
      </div>

      <!-- Calendar buttons -->
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#9a8a72;text-transform:uppercase;letter-spacing:0.05em;">Add to Calendar</p>
      <div style="display:flex;gap:10px;margin-bottom:16px;">
        ${gcalLink ? `<a href="${gcalLink}" style="flex:1;background:#c9a84c;color:#ffffff;text-decoration:none;text-align:center;padding:11px 16px;border-radius:999px;font-size:13px;font-weight:600;">📅 Google Calendar</a>` : ''}
      </div>
      <p style="margin:0 0 24px;font-size:13px;color:#9a8a72;">🍎 For Apple Calendar & Outlook — open the <strong>booking.ics</strong> attachment below.</p>

      <!-- Footer -->
      <p style="margin:0;font-size:12px;color:#9a8a72;text-align:center;">Stripe Session: ${session.id}</p>
    </div>
  </div>
</body>
</html>`

    const emailRes  = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:        'Mes Decor <onboarding@resend.dev>',
        to:          [adminEmail],
        subject,
        html,
        attachments: date && time ? [{
          filename: 'booking.ics',
          content:  Buffer.from(buildICS(title, date, time, location, description)).toString('base64'),
        }] : [],
      }),
    })
    const emailJson = await emailRes.json()
    console.log('Resend response:', JSON.stringify(emailJson))

    // Save booking to Airtable
    await createAirtableBooking(name, items, date, time, location, amount)
  }

  return { statusCode: 200, body: 'OK' }
}
