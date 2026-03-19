import React, { useState, useEffect, useCallback } from 'react'

type ItemKey = 'serpentine-table' | 'chiavari-chairs' | 'grad-marquee'
type PaymentType = 'full' | 'deposit'

interface ExperienceItem {
  id:       number
  key:      ItemKey
  name:     string
  images:   string[]
  fullPrice: number   // in dollars
  unit:     string    // e.g. 'item' | 'chair'
  maxQty:   number
}

const ITEMS: ExperienceItem[] = [
  { id: 1, key: 'serpentine-table', name: 'Serpentine Table',     images: ['/rental/rental1.jpg'], fullPrice: 300, unit: 'item',  maxQty: 1  },
  { id: 2, key: 'chiavari-chairs',  name: 'Chiavari Chairs',      images: ['/rental/rental2.jpg'], fullPrice: 5,   unit: 'chair', maxQty: 40 },
  { id: 3, key: 'grad-marquee',     name: 'Grad Marquee Letters', images: ['/rental/rental3.jpg'], fullPrice: 200, unit: 'item',  maxQty: 1  },
]

// ── Checkout helper ─────────────────────────────────────────
async function startCheckout(item: ItemKey, paymentType: PaymentType, quantity: number): Promise<void> {
  const res  = await fetch('/.netlify/functions/create-checkout', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ item, paymentType, quantity }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

// ── Lightbox ────────────────────────────────────────────────
function Lightbox({ item, onClose }: { item: ExperienceItem; onClose: () => void }): React.ReactElement {
  const [slide, setSlide] = useState<number>(0)
  const prev = useCallback(() => setSlide((s) => (s - 1 + item.images.length) % item.images.length), [item.images.length])
  const next = useCallback(() => setSlide((s) => (s + 1) % item.images.length), [item.images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  return (
    <div className="fixed inset-0 bg-[rgba(20,12,4,0.92)] backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-[820px] bg-dark rounded-[20px] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 z-10 bg-black/50 border-none text-off-white text-lg w-9 h-9 rounded-full cursor-pointer flex items-center justify-center hover:bg-black/80 transition-colors" onClick={onClose}>✕</button>
        <div className="w-full aspect-[4/3] overflow-hidden bg-dark-deep">
          <img src={item.images[slide]} alt={item.name} className="w-full h-full object-contain block" />
        </div>
        {item.images.length > 1 && (
          <>
            <button className="absolute top-1/2 left-3 -translate-y-[60%] bg-black/45 border-none text-off-white text-4xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-gold transition-colors z-10" onClick={prev}>‹</button>
            <button className="absolute top-1/2 right-3 -translate-y-[60%] bg-black/45 border-none text-off-white text-4xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-gold transition-colors z-10" onClick={next}>›</button>
          </>
        )}
        <div className="flex items-center justify-between px-5 py-3.5 gap-3">
          <span className="text-[15px] font-semibold text-off-white flex-1">{item.name}</span>
          {item.images.length > 1 && (
            <div className="flex gap-1.5">
              {item.images.map((_, i) => (
                <button key={i} className={`w-2 h-2 rounded-full border-none cursor-pointer p-0 transition-colors ${i === slide ? 'bg-gold' : 'bg-white/30'}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          )}
          <span className="text-[13px] text-text-muted whitespace-nowrap">{slide + 1} / {item.images.length}</span>
        </div>
      </div>
    </div>
  )
}

// ── Payment Panel ────────────────────────────────────────────
function PaymentPanel({ item, onClose }: { item: ExperienceItem; onClose: () => void }): React.ReactElement {
  const [qty,     setQty]     = useState<number>(1)
  const [loading, setLoading] = useState<PaymentType | null>(null)

  const total   = item.fullPrice * qty
  const deposit = Math.round(total * 0.5)

  const pay = async (type: PaymentType): Promise<void> => {
    setLoading(type)
    await startCheckout(item.key, type, qty)
    setLoading(null)
  }

  return (
    <div className="fixed inset-0 bg-[rgba(20,12,4,0.85)] backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-off-white rounded-[20px] w-full max-w-[400px] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-dark px-6 py-5 flex items-center justify-between">
          <h3 className="text-off-white font-bold text-[17px]">{item.name}</h3>
          <button className="bg-white/10 border-none text-off-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors" onClick={onClose}>✕</button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* Quantity (chairs only) */}
          {item.unit === 'chair' && (
            <div>
              <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">Number of Chairs (max {item.maxQty})</label>
              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-full border border-border-col bg-white flex items-center justify-center text-lg font-bold text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >−</button>
                <span className="text-[20px] font-bold text-text-dark w-8 text-center">{qty}</span>
                <button
                  className="w-9 h-9 rounded-full border border-border-col bg-white flex items-center justify-center text-lg font-bold text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors"
                  onClick={() => setQty((q) => Math.min(item.maxQty, q + 1))}
                >+</button>
              </div>
            </div>
          )}

          {/* Price summary */}
          <div className="bg-cream rounded-[12px] px-4 py-4 flex flex-col gap-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-text-muted">
                {item.unit === 'chair' ? `$${item.fullPrice} × ${qty} chair${qty > 1 ? 's' : ''}` : 'Rental price'}
              </span>
              <span className="font-semibold text-text-dark">${total}</span>
            </div>
            <div className="flex justify-between text-[13px] text-text-muted">
              <span>50% deposit</span>
              <span>${deposit}</span>
            </div>
          </div>

          {/* Payment buttons */}
          <div className="flex flex-col gap-3">
            <button
              className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={loading !== null}
              onClick={() => void pay('full')}
            >
              {loading === 'full' ? 'Redirecting…' : `Pay in Full  $${total}`}
            </button>
            <button
              className="w-full py-3 rounded-pill bg-white border border-gold text-gold font-semibold text-[14px] cursor-pointer hover:bg-gold hover:text-off-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={loading !== null}
              onClick={() => void pay('deposit')}
            >
              {loading === 'deposit' ? 'Redirecting…' : `Pay Deposit  $${deposit}`}
            </button>
          </div>

          <p className="text-[11px] text-text-muted text-center">Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function Experience(): React.ReactElement {
  const [lightboxItem, setLightboxItem] = useState<ExperienceItem | null>(null)
  const [payItem,      setPayItem]      = useState<ExperienceItem | null>(null)

  return (
    <>
      <section className="bg-dark px-12 tab:px-6 mob:px-4 py-16 tab:py-12 mob:py-10 text-center" id="rentals">
        <h2 className="text-4xl mob:text-2xl font-bold text-off-white mb-3 tracking-tight">Rentals</h2>
        <p className="text-[14px] text-white/50 leading-relaxed mb-12 tab:mb-10 mob:mb-8">
          Browse our curated collection of premium rental pieces<br />
          everything you need to bring your vision to life.
        </p>

        <div className="grid grid-cols-2 mob:grid-cols-1 gap-6 max-w-[1000px] mx-auto">
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className="relative rounded-card overflow-hidden cursor-pointer group"
              onClick={() => setLightboxItem(item)}
            >
              <div className="h-[360px] tab:h-[280px] mob:h-[220px] overflow-hidden">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105" />
              </div>

              {/* Overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{ background: 'linear-gradient(to top, rgba(30,21,8,0.92) 0%, rgba(30,21,8,0) 100%)' }}
              >
                <div className="flex items-end justify-between gap-3">
                  <div className="text-left">
                    <p className="text-[15px] mob:text-[13px] font-semibold text-off-white">{item.name}</p>
                    <p className="text-[13px] text-gold font-bold mt-0.5">
                      {item.unit === 'chair' ? `$${item.fullPrice} / chair` : `$${item.fullPrice}`}
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-3 py-2 pl-[18px] mob:px-2 mob:py-1.5 mob:pl-3 mob:text-[12px] rounded-pill bg-gold border-none text-off-white text-[13px] font-semibold cursor-pointer hover:bg-gold-dark transition-colors whitespace-nowrap"
                    onClick={(e) => { e.stopPropagation(); setPayItem(item) }}
                  >
                    Book Now
                    <span className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
      {payItem      && <PaymentPanel item={payItem}  onClose={() => setPayItem(null)} />}
    </>
  )
}
