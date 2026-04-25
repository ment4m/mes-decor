import React, { useState, useEffect } from 'react'
import { RENTAL_ITEMS } from './Experience'
import { fetchItemPrices } from '../lib/airtable'

const ORS_KEY         = import.meta.env.VITE_ORS_KEY as string
const BUSINESS_LNG    = -96.6989
const BUSINESS_LAT    = 33.0198
const RATE_PER_MILE   = 0.75
const MAX_DELIVERY_MI = 50

function cleanAddress(raw: string): string {
  return raw
    .replace(/\b(apt|apartment|unit|suite|ste|#)\s*[\w-]+/gi, '') // remove apt/unit numbers
    .replace(/\bAve(nue)?\b/gi, 'Ave')
    .replace(/\bSt(reet)?\b/gi,  'St')
    .replace(/\bDr(ive)?\b/gi,   'Dr')
    .replace(/\bRd\b/gi,         'Rd')
    .replace(/\bBlvd\b/gi,       'Blvd')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function calcDelivery(address: string): Promise<{ fee: number; miles: number } | { error: string }> {
  try {
    const cleaned = cleanAddress(address)
    const geoRes  = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(cleaned)}&boundary.country=US&focus.point.lat=${BUSINESS_LAT}&focus.point.lon=${BUSINESS_LNG}&size=1`
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
    if (oneWayMiles > MAX_DELIVERY_MI) return { error: `Sorry, we only deliver within ${MAX_DELIVERY_MI} miles. You are ${Math.round(oneWayMiles)} miles away.` }

    // 2 round trips: deliver items + pick up items
    const totalMiles = oneWayMiles * 4
    const fee = Math.max(20, Math.round(totalMiles * RATE_PER_MILE))
    return { fee, miles: Math.round(oneWayMiles * 10) / 10 }
  } catch {
    return { error: 'Failed to calculate distance. Please try again.' }
  }
}

async function startCheckout(
  amountCents: number,
  label:       string,
  date:        string,
  time:        string,
  location:    string,
  clientName:  string,
  paymentType: 'full' | 'deposit',
): Promise<void> {
  const res  = await fetch('/.netlify/functions/create-checkout', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      items:       [{ name: label, amountCents, quantity: 1 }],
      paymentType,
      date,
      time,
      location,
      clientName,
    }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

export default function PayPage(): React.ReactElement {
  const params     = new URLSearchParams(window.location.search)
  const items      = params.getAll('item')
  const images     = params.getAll('image')
  const totalParam   = params.get('total')  ? Number(params.get('total'))  : null
  const amountParam  = params.get('amount') ? Number(params.get('amount')) : null
  const noteParam    = params.get('note')   ?? ''

  const [clientName,    setClientName]    = useState<string>('')
  const [date,          setDate]          = useState<string>(params.get('date') ?? '')
  const [time,          setTime]          = useState<string>(params.get('time') ?? '')
  const [location,      setLocation]      = useState<string>(params.get('location') ?? '')
  const [deliveryType,  setDeliveryType]  = useState<'pickup' | 'delivery'>('pickup')
  const [address,       setAddress]       = useState<string>('')
  const [zipCode,       setZipCode]       = useState<string>('')
  const [deliveryInfo,  setDeliveryInfo]  = useState<{ fee: number; miles: number } | null>(null)
  const [deliveryErr,   setDeliveryErr]   = useState<string>('')
  const [calculating,   setCalculating]   = useState<boolean>(false)
  const [loading,       setLoading]       = useState<boolean>(false)
  const [dynamicItems,  setDynamicItems]  = useState(RENTAL_ITEMS)

  useEffect(() => {
    fetchItemPrices().then((prices) => {
      if (!prices.length) return
      setDynamicItems(RENTAL_ITEMS.map((ri) => {
        const match = prices.find((p) => p.name === ri.name)
        return match ? { ...ri, fullPrice: match.price } : ri
      }))
    }).catch(() => {})
  }, [])
  const [error,         setError]         = useState<string>('')

  const isBalanceMode = amountParam !== null
  const rentalPrice   = totalParam ?? 0
  const deliveryFee   = deliveryType === 'delivery' && deliveryInfo ? deliveryInfo.fee : 0
  const grandTotal    = rentalPrice + deliveryFee
  const deliveryReady = deliveryType === 'pickup'
                        || (address.trim() !== '' && zipCode.trim() !== '' && deliveryInfo !== null)
  const canPay        = isBalanceMode
                        ? true
                        : date.trim() !== '' && time.trim() !== '' && location.trim() !== '' && deliveryReady

  const handleCalcDelivery = async (): Promise<void> => {
    if (!address.trim() && !zipCode.trim()) return
    setCalculating(true)
    setDeliveryErr('')
    setDeliveryInfo(null)
    const result = await calcDelivery(`${address.trim()}, ${zipCode.trim()}`)
    if ('error' in result) setDeliveryErr(result.error)
    else setDeliveryInfo(result)
    setCalculating(false)
  }

  const switchDelivery = (type: 'pickup' | 'delivery'): void => {
    setDeliveryType(type)
    setDeliveryInfo(null)
    setDeliveryErr('')
    setAddress('')
    setZipCode('')
  }

  const handlePay = async (paymentType: 'full' | 'deposit'): Promise<void> => {
    if (!canPay) return
    setLoading(true)
    setError('')
    try {
      const label      = `Mes Decor – ${clientName || items.join(', ') || 'Booking'}`
      const amountCents = isBalanceMode
        ? Math.round((amountParam as number) * 100)
        : Math.round(grandTotal * 100)
      await startCheckout(amountCents, label, date, time, location, clientName, paymentType)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[14px] text-text-dark outline-none focus:border-gold bg-white transition-colors'

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 mob:px-3 py-12">

      {/* Brand */}
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="Mes Decor"
          className="w-14 h-14 rounded-full border-2 border-gold mx-auto mb-3 cursor-pointer"
          onClick={() => { window.location.href = '/' }}
        />
        <h1 className="text-[26px] mob:text-[22px] font-bold text-text-dark">{isBalanceMode ? 'Pay Remaining Balance' : 'Complete Booking'}</h1>
        <p className="text-text-muted text-[14px] mt-1">Secure payment powered by Stripe</p>
      </div>

      <div className="w-full max-w-[460px] bg-white rounded-[20px] shadow-sm border border-border-col px-6 mob:px-4 py-7 flex flex-col gap-5">

        {/* Item images grid */}
        {images.length > 0 && (
          <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.map((src, i) => {
              const itemName   = items[i] ?? ''
              const rentalItem = dynamicItems.find((r) => r.name === itemName)
              const priceLabel = rentalItem
                ? rentalItem.unit === 'chair'
                  ? `$${rentalItem.fullPrice}/chair`
                  : `$${rentalItem.fullPrice}`
                : null
              return (
                <div key={i} className="rounded-[12px] overflow-hidden border border-border-col">
                  <img src={src} alt={itemName} className="w-full h-[160px] object-cover block" />
                  {itemName && (
                    <div className="px-3 py-2 bg-cream flex items-center justify-between gap-2">
                      <p className="text-[12px] font-semibold text-text-dark">{itemName}</p>
                      {priceLabel && <p className="text-[12px] font-bold text-gold whitespace-nowrap">{priceLabel}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary info */}
        {(items.length > 0 && images.length === 0 || noteParam) && (
          <div className="bg-cream rounded-[12px] px-4 py-4 flex flex-col gap-1.5">
            {items.length > 0 && images.length === 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted">{items.length === 1 ? 'Item' : 'Items'}</span>
                <span className="font-semibold text-text-dark text-right">{items.join(', ')}</span>
              </div>
            )}
            {noteParam && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted">Note</span>
                <span className="font-semibold text-text-dark">{noteParam}</span>
              </div>
            )}
          </div>
        )}

        {/* Event details */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">
            {isBalanceMode ? 'Your Name' : 'Event Details'}
          </p>

          <div>
            <label className="text-[12px] text-text-muted block mb-1">Your Name</label>
            <input type="text" placeholder="Full name" value={clientName}
              onChange={(e) => setClientName(e.target.value)} className={inputClass} />
          </div>

          {!isBalanceMode && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-text-muted block mb-1">Date *</label>
                  <input type="date" value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] text-text-muted block mb-1">Time *</label>
                  <input type="time" value={time}
                    min={date === new Date().toISOString().split('T')[0]
                      ? `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
                      : undefined}
                    onChange={(e) => setTime(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-[12px] text-text-muted block mb-1">Location / Venue *</label>
                <input type="text" placeholder="Venue name or address" value={location}
                  onChange={(e) => setLocation(e.target.value)} className={inputClass} />
              </div>
            </>
          )}
        </div>

        {/* Pickup or Delivery — hidden in balance mode */}
        {!isBalanceMode && (
          <div>
            <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Pickup or Delivery</p>
            <div className="flex gap-3 mb-3">
              <button
                className={`flex-1 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-colors cursor-pointer ${deliveryType === 'pickup' ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}
                onClick={() => switchDelivery('pickup')}
              >Pickup</button>
              <button
                className={`flex-1 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-colors cursor-pointer ${deliveryType === 'delivery' ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}
                onClick={() => switchDelivery('delivery')}
              >Delivery</button>
            </div>
            {deliveryType === 'pickup' && (
              <p className="text-[12px] text-text-muted">You will pick up and return the items yourself.</p>
            )}
            {deliveryType === 'delivery' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Street address *" value={address}
                    onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="ZIP code *" value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)} className={inputClass} />
                </div>
                <button
                  onClick={() => void handleCalcDelivery()}
                  disabled={calculating || (!address.trim() && !zipCode.trim())}
                  className="w-full py-2.5 rounded-[10px] border border-gold text-gold font-semibold text-[13px] bg-white cursor-pointer hover:bg-gold hover:text-off-white transition-colors disabled:opacity-50"
                >{calculating ? 'Calculating…' : 'Calculate Delivery Fee'}</button>
                {deliveryErr  && <p className="text-red-500 text-[12px]">{deliveryErr}</p>}
                {deliveryInfo && (
                  <p className="text-[12px] text-green-600 font-semibold">
                    {deliveryInfo.miles} mi away · 2 round trips · Delivery fee: ${deliveryInfo.fee}
                  </p>
                )}
                {!deliveryInfo && !deliveryErr && (
                  <p className="text-[11px] text-text-muted">Rate: $0.75/mile · 2 round trips (delivery + pickup) · Max {MAX_DELIVERY_MI} miles</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Price summary */}
        {isBalanceMode ? (
          <div className="bg-cream rounded-[12px] px-4 py-4 flex justify-between items-center">
            <span className="font-bold text-text-dark text-[15px]">Remaining Balance</span>
            <span className="font-bold text-gold text-[20px]">${amountParam}</span>
          </div>
        ) : (
          <div className="bg-cream rounded-[12px] px-4 py-4 flex flex-col gap-1.5">
            {rentalPrice > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted">Rental</span>
                <span className="font-semibold text-text-dark">${rentalPrice}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted">Delivery ({deliveryInfo!.miles} mi × 4)</span>
                <span className="font-semibold text-text-dark">${deliveryFee}</span>
              </div>
            )}
            <div className={`flex justify-between text-[15px] ${rentalPrice > 0 || deliveryFee > 0 ? 'border-t border-border-col pt-2 mt-1' : ''}`}>
              <span className="font-bold text-text-dark">Grand Total</span>
              <span className="font-bold text-gold">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-[13px]">{error}</p>}

        {!isBalanceMode && deliveryType === 'delivery' && (
          <>
            {(!address.trim() || !zipCode.trim()) && (
              <p className="text-red-500 text-[12px] text-center">Street address and ZIP code are required for delivery.</p>
            )}
            {address.trim() && zipCode.trim() && !deliveryInfo && (
              <p className="text-[12px] text-text-muted text-center">Please calculate your delivery fee to continue.</p>
            )}
          </>
        )}

        {/* Payment buttons */}
        <div className="flex flex-col gap-2">
          {isBalanceMode ? (
            <button
              onClick={() => void handlePay('full')}
              disabled={loading || !canPay}
              className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecting…' : 'Pay Remaining Balance'}
            </button>
          ) : (
            <>
              <button
                onClick={() => void handlePay('full')}
                disabled={loading || !canPay}
                className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Redirecting…' : 'Pay Full'}
              </button>
              <button
                onClick={() => void handlePay('deposit')}
                disabled={loading || !canPay}
                className="w-full py-3 rounded-pill bg-white text-gold font-semibold text-[14px] border border-gold cursor-pointer hover:bg-gold hover:text-off-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Redirecting…' : 'Pay 50% Deposit'}
              </button>
            </>
          )}
        </div>

        <p className="text-[11px] text-text-muted text-center">
          Your payment is processed securely by Stripe.<br />
          You will receive a confirmation email after payment.
        </p>
      </div>
    </div>
  )
}
