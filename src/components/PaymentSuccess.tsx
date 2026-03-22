import React from 'react'

export default function PaymentSuccess(): React.ReactElement {
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
          <p className="text-white/80 text-[14px] mt-1">Your booking has been confirmed</p>
        </div>

        <div className="px-8 py-8 flex flex-col gap-5">
          <p className="text-text-dark text-[15px] leading-relaxed">
            Thank you for booking with <strong>Mes Decor</strong>. We've received your payment and will be in touch shortly to confirm the details of your event.
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
                We'll contact you via WhatsApp to confirm your event details
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold font-bold mt-0.5">✓</span>
                Your rental items will be reserved for your date
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { window.location.href = '/' }}
              className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors"
            >
              Back to Home
            </button>
            <a
              href="https://wa.me/19723755225"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-pill border border-gold text-gold font-semibold text-[14px] cursor-pointer hover:bg-gold hover:text-off-white transition-colors flex items-center justify-center gap-2 no-underline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact Us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
