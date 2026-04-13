import React, { useState, useEffect, useCallback } from 'react'

export type ItemKey = 'serpentine-table' | 'chiavari-chairs' | 'grad-marquee'
export type PaymentType = 'full' | 'deposit'
type DeliveryType = 'pickup' | 'delivery'

export interface ExperienceItem {
  id:        number
  key:       ItemKey
  name:      string
  images:    string[]
  fullPrice: number
  unit:      string
  maxQty:    number
  minQty?:   number
}

export const RENTAL_ITEMS: ExperienceItem[] = [
  { id: 1, key: 'serpentine-table', name: 'Serpentine Table',     images: ['/rental/rental1.jpg'], fullPrice: 300, unit: 'item',  maxQty: 1  },
  { id: 2, key: 'chiavari-chairs',  name: 'Chiavari Chairs',      images: ['/rental/rental2.jpg'], fullPrice: 5,   unit: 'chair', maxQty: 40, minQty: 10 },
  { id: 3, key: 'grad-marquee',     name: 'Grad Marquee Letters', images: ['/rental/rental3.jpg'], fullPrice: 200, unit: 'item',  maxQty: 1  },
]

const ITEMS = RENTAL_ITEMS

// ── Delivery helpers ─────────────────────────────────────────
const ORS_KEY          = import.meta.env.VITE_ORS_KEY as string
const BUSINESS_LNG     = -96.6989
const BUSINESS_LAT     = 33.0198
const MIN_DELIVERY_FEE = 10
const MAX_DELIVERY_MI  = 50
const RATE_PER_MILE    = 1

async function calcDelivery(address: string): Promise<{ fee: number; miles: number } | { error: string }> {
  try {
    const geoRes  = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(address)}&boundary.country=US&size=1`
    )
    const geoData = await geoRes.json()
    if (!geoData.features?.length) return { error: 'Address not found. Please check and try again.' }

    const [lng, lat] = geoData.features[0].geometry.coordinates as [number, number]

    const dirRes  = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${BUSINESS_LNG},${BUSINESS_LAT}&end=${lng},${lat}`
    )
    const dirData = await dirRes.json()
    const meters: number = dirData.features?.[0]?.properties?.segments?.[0]?.distance
    if (!meters) return { error: 'Could not calculate distance. Try a more specific address.' }

    const oneWayMiles = meters / 1609.34
    if (oneWayMiles > MAX_DELIVERY_MI) return { error: `Sorry, we only deliver within ${MAX_DELIVERY_MI} miles. Your location is ${Math.round(oneWayMiles)} miles away.` }

    const roundTripMiles = oneWayMiles * 2
    const fee = Math.max(MIN_DELIVERY_FEE, Math.round(roundTripMiles * RATE_PER_MILE))
    return { fee, miles: Math.round(oneWayMiles * 10) / 10 }
  } catch {
    return { error: 'Failed to calculate distance. Please try again.' }
  }
}

// ── Checkout helper ──────────────────────────────────────────
interface CheckoutLineItem { name: string; amountCents: number; quantity: number }

async function startCheckout(items: CheckoutLineItem[], paymentType: PaymentType): Promise<void> {
  const res  = await fetch('/.netlify/functions/create-checkout', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ items, paymentType }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

// ── Lightbox ─────────────────────────────────────────────────
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
export function PaymentPanel({ item, onClose }: { item: ExperienceItem; onClose: () => void }): React.ReactElement {
  const minQty = item.minQty ?? 1

  // Main item qty
  const [qty,          setQty]         = useState<number>(minQty)
  // Additional items: key -> qty
  const [extras,       setExtras]       = useState<Partial<Record<ItemKey, number>>>({})
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [address,      setAddress]      = useState<string>('')
  const [zipCode,      setZipCode]      = useState<string>('')
  const [deliveryInfo, setDeliveryInfo] = useState<{ fee: number; miles: number } | null>(null)
  const [deliveryErr,  setDeliveryErr]  = useState<string>('')
  const [calculating,  setCalculating]  = useState<boolean>(false)
  const [loading,      setLoading]      = useState<PaymentType | null>(null)

  const otherItems = ITEMS.filter((i) => i.key !== item.key)

  const rentalTotal = item.fullPrice * qty
    + otherItems.reduce((sum, i) => sum + (extras[i.key] ? i.fullPrice * (extras[i.key] as number) : 0), 0)
  const deliveryFee = deliveryType === 'delivery' && deliveryInfo ? deliveryInfo.fee : 0
  const grandTotal  = rentalTotal + deliveryFee
  const deposit     = Math.round(grandTotal * 0.5)
  const canPay      = deliveryType === 'pickup' || deliveryInfo !== null

  const toggleExtra = (key: ItemKey, minQ: number): void => {
    setExtras((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = minQ
      return next
    })
  }

  const setExtraQty = (key: ItemKey, q: number, max: number, min: number): void => {
    setExtras((prev) => ({ ...prev, [key]: Math.min(max, Math.max(min, q)) }))
  }

  const handleCalc = async (): Promise<void> => {
    if (!address.trim() || !zipCode.trim()) return
    setCalculating(true)
    setDeliveryErr('')
    setDeliveryInfo(null)
    const result = await calcDelivery(`${address.trim()}, ${zipCode.trim()}`)
    setCalculating(false)
    if ('error' in result) setDeliveryErr(result.error)
    else setDeliveryInfo(result)
  }

  const pay = async (type: PaymentType): Promise<void> => {
    if (!canPay) return
    setLoading(type)
    const lineItems: CheckoutLineItem[] = [
      { name: item.name, amountCents: item.fullPrice * qty * 100, quantity: 1 },
      ...otherItems
        .filter((i) => extras[i.key])
        .map((i) => ({ name: i.name, amountCents: i.fullPrice * (extras[i.key] as number) * 100, quantity: 1 })),
    ]
    if (deliveryFee > 0) lineItems.push({ name: 'Delivery Fee', amountCents: deliveryFee * 100, quantity: 1 })
    await startCheckout(lineItems, type)
    setLoading(null)
  }

  const switchDelivery = (type: DeliveryType): void => {
    setDeliveryType(type)
    setDeliveryInfo(null)
    setDeliveryErr('')
    setAddress('')
    setZipCode('')
  }

  return (
    <div className="fixed inset-0 bg-[rgba(20,12,4,0.85)] backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-off-white rounded-[20px] w-full max-w-[420px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-dark px-6 py-5 flex items-center justify-between">
          <h3 className="text-off-white font-bold text-[17px]">{item.name}</h3>
          <button className="bg-white/10 border-none text-off-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors" onClick={onClose}>✕</button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">

          {/* Quantity — chairs only */}
          {item.unit === 'chair' && (
            <div>
              <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                Number of Chairs (min {minQty}, max {item.maxQty})
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-full border border-border-col bg-white flex items-center justify-center text-lg font-bold text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors"
                  onClick={() => setQty((q) => Math.max(minQty, q - 1))}
                >−</button>
                <span className="text-[20px] font-bold text-text-dark w-8 text-center">{qty}</span>
                <button
                  className="w-9 h-9 rounded-full border border-border-col bg-white flex items-center justify-center text-lg font-bold text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors"
                  onClick={() => setQty((q) => Math.min(item.maxQty, q + 1))}
                >+</button>
              </div>
            </div>
          )}

          {/* Add another item */}
          {otherItems.length > 0 && (
            <div>
              <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">Add Another Item</label>
              <div className="flex flex-col gap-2">
                {otherItems.map((oi) => {
                  const checked = Boolean(extras[oi.key])
                  const oiMin   = oi.minQty ?? 1
                  return (
                    <div key={oi.key} className="bg-white border border-border-col rounded-[12px] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExtra(oi.key, oiMin)}
                            className="accent-gold w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <p className="text-[13px] font-semibold text-text-dark">{oi.name}</p>
                            <p className="text-[12px] text-text-muted">
                              {oi.unit === 'chair' ? `$${oi.fullPrice}/chair` : `$${oi.fullPrice}`}
                            </p>
                          </div>
                        </label>
                        {checked && oi.unit === 'chair' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              className="w-7 h-7 rounded-full border border-border-col bg-white flex items-center justify-center text-sm font-bold text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors"
                              onClick={() => setExtraQty(oi.key, (extras[oi.key] ?? oiMin) - 1, oi.maxQty, oiMin)}
                            >−</button>
                            <span className="text-[14px] font-bold text-text-dark w-6 text-center">{extras[oi.key]}</span>
                            <button
                              className="w-7 h-7 rounded-full border border-border-col bg-white flex items-center justify-center text-sm font-bold text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors"
                              onClick={() => setExtraQty(oi.key, (extras[oi.key] ?? oiMin) + 1, oi.maxQty, oiMin)}
                            >+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pickup / Delivery toggle */}
          <div>
            <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">Pickup or Delivery</label>
            <div className="flex gap-3">
              <button
                className={`flex-1 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-colors ${deliveryType === 'pickup' ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-mid hover:border-gold'}`}
                onClick={() => switchDelivery('pickup')}
              >
                Pickup
              </button>
              <button
                className={`flex-1 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-colors ${deliveryType === 'delivery' ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-mid hover:border-gold'}`}
                onClick={() => switchDelivery('delivery')}
              >
                Delivery (+$1/mile)
              </button>
            </div>
            {deliveryType === 'pickup' && (
              <p className="text-[11px] text-text-muted mt-2">Pickup from: 525 N Ave, Plano, TX 75074</p>
            )}
          </div>

          {/* Delivery address input */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">Your Address</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Street address"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setDeliveryInfo(null); setDeliveryErr('') }}
                  className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ZIP code"
                    value={zipCode}
                    onChange={(e) => { setZipCode(e.target.value); setDeliveryInfo(null); setDeliveryErr('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleCalc() }}
                    className="flex-1 border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white"
                  />
                  <button
                    onClick={() => void handleCalc()}
                    disabled={calculating || !address.trim() || !zipCode.trim()}
                    className="px-3 py-2.5 bg-gold text-off-white rounded-[10px] text-[12px] font-semibold border-none cursor-pointer hover:bg-gold-dark transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {calculating ? '...' : 'Calculate'}
                  </button>
                </div>
              </div>
              {deliveryErr  && <p className="text-red-500 text-[12px] mt-1.5">{deliveryErr}</p>}
              {deliveryInfo && (
                <p className="text-[12px] text-green-700 mt-1.5 font-medium">
                  {deliveryInfo.miles} miles away ({(deliveryInfo.miles * 2).toFixed(1)} mi round trip) — delivery fee: ${deliveryInfo.fee}
                </p>
              )}
              {!deliveryInfo && !deliveryErr && (
                <p className="text-[11px] text-text-muted mt-1.5">Enter your address or ZIP code. Fee is based on round trip ($1/mile, min $10, max {MAX_DELIVERY_MI} miles one way).</p>
              )}
            </div>
          )}

          {/* Price summary */}
          <div className="bg-cream rounded-[12px] px-4 py-4 flex flex-col gap-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-text-muted">
                {item.unit === 'chair' ? `$${item.fullPrice} × ${qty} chair${qty > 1 ? 's' : ''}` : 'Rental price'}
              </span>
              <span className="font-semibold text-text-dark">${rentalTotal}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted">Delivery ({deliveryInfo!.miles} mi)</span>
                <span className="font-semibold text-text-dark">${deliveryFee}</span>
              </div>
            )}
            <div className="border-t border-border-col mt-1 pt-2 flex justify-between text-[15px]">
              <span className="font-bold text-text-dark">Total</span>
              <span className="font-bold text-text-dark">${grandTotal}</span>
            </div>
            <div className="flex justify-between text-[13px] text-text-muted">
              <span>50% deposit</span>
              <span>${deposit}</span>
            </div>
          </div>

          {/* Payment buttons */}
          <div className="flex flex-col gap-3">
            <button
              className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading !== null || !canPay}
              onClick={() => void pay('full')}
            >
              {loading === 'full' ? 'Redirecting…' : `Pay in Full  $${grandTotal}`}
            </button>
            <button
              className="w-full py-3 rounded-pill bg-white border border-gold text-gold font-semibold text-[14px] cursor-pointer hover:bg-gold hover:text-off-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading !== null || !canPay}
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
