import React from 'react'

export default function PaymentSuccess(): React.ReactElement {
  const params   = new URLSearchParams(window.location.search)
  const date     = params.get('date')     ?? ''
  const time     = params.get('time')     ?? ''
  const location = params.get('location') ?? ''
  const name     = params.get('name')     ?? ''
  const items    = params.getAll('item')

  // Format date nicely: 2025-06-14 → Saturday, June 14 2025
  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  // Format time: 14:30 → 2:30 PM
  const formattedTime = time
    ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : ''

  const hasEventInfo = date || time || location

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-off-white rounded-[24px] w-full max-w-[480px] overflow-hidden shadow-2xl text-center">

        {/* Header */}
        <div className="bg-gold px-6 py-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-off-white text-[24px] font-bold">Payment Successful!</h1>
          <p className="text-white/80 text-[14px] mt-1">
            {name ? `Thank you, ${name}!` : 'Your booking has been confirmed'}
          </p>
        </div>

        <div className="px-8 py-8 flex flex-col gap-5">

          {/* See you message */}
          {hasEventInfo && (
            <div className="bg-gold/10 border border-gold/30 rounded-[14px] px-5 py-5 text-left flex flex-col gap-2">
              <p className="text-gold font-bold text-[13px] uppercase tracking-wider mb-1">See you there!</p>
              {items.length > 0 && (
                <div className="flex items-start gap-2 text-[14px] text-text-dark">
                  <span className="text-gold mt-0.5">✦</span>
                  <span><strong>{items.join(', ')}</strong></span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-start gap-2 text-[14px] text-text-dark">
                  <span className="text-gold mt-0.5">📅</span>
                  <span>{formattedDate}</span>
                </div>
              )}
              {formattedTime && (
                <div className="flex items-start gap-2 text-[14px] text-text-dark">
                  <span className="text-gold mt-0.5">🕐</span>
                  <span>{formattedTime}</span>
                </div>
              )}
              {location && (
                <div className="flex items-start gap-2 text-[14px] text-text-dark">
                  <span className="text-gold mt-0.5">📍</span>
                  <span>{location}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-text-dark text-[15px] leading-relaxed">
            Thank you for booking with <strong>Mes Decor</strong>. We've received your payment and will be in touch shortly to confirm the final details.
          </p>

          <div className="bg-cream rounded-[14px] px-5 py-4 text-left">
            <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">What's next?</p>
            <ul className="flex flex-col gap-2 text-[13px] text-text-dark">
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold mt-0.5">✓</span>
                Check your email for a payment receipt from Stripe
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold mt-0.5">✓</span>
                We'll reach out to confirm your event details
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold mt-0.5">✓</span>
                Your rental items are reserved for your date
              </li>
            </ul>
          </div>

          <button
            onClick={() => { window.location.href = '/' }}
            className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
