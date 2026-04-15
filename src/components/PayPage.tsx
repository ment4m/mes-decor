import React, { useState } from 'react'

async function startCheckout(amountCents: number, label: string): Promise<void> {
  const res  = await fetch('/.netlify/functions/create-checkout', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      items:       [{ name: label, amountCents, quantity: 1 }],
      paymentType: 'full',
    }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
}

export default function PayPage(): React.ReactElement {
  const params     = new URLSearchParams(window.location.search)
  const items      = params.getAll('item')    // one or more item names
  const images     = params.getAll('image')   // matching images
  const totalParam = params.get('total') ? Number(params.get('total')) : null
  const noteParam  = params.get('note')  ?? ''

  const [depositInput, setDepositInput] = useState<string>('')
  const [loading,      setLoading]      = useState<boolean>(false)
  const [error,        setError]        = useState<string>('')

  const depositAmount = Number(depositInput) || 0
  const maxAmount     = totalParam ?? Infinity
  const isValid       = depositAmount >= 1 && depositAmount <= maxAmount

  const handlePay = async (): Promise<void> => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const label = items.length > 0
        ? `Deposit – ${items.join(', ')}`
        : 'Deposit'
      await startCheckout(Math.round(depositAmount * 100), label)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 mob:px-3 py-12">

      {/* Brand */}
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="Mes Decor"
          className="w-14 h-14 rounded-full border-2 border-gold mx-auto mb-3 cursor-pointer"
          onClick={() => window.location.href = '/'}
        />
        <h1 className="text-[26px] mob:text-[22px] font-bold text-text-dark">Pay Deposit</h1>
        <p className="text-text-muted text-[14px] mt-1">Secure payment powered by Stripe</p>
      </div>

      <div className="w-full max-w-[460px] bg-white rounded-[20px] shadow-sm border border-border-col px-6 mob:px-4 py-7 flex flex-col gap-5">

        {/* Item images grid */}
        {images.length > 0 && (
          <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.map((src, i) => (
              <div key={i} className="rounded-[12px] overflow-hidden border border-border-col">
                <img src={src} alt={items[i] ?? ''} className="w-full h-[160px] object-cover block" />
                {items[i] && (
                  <p className="text-[12px] font-semibold text-text-dark px-3 py-2 bg-cream">{items[i]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary info */}
        {(items.length > 0 || noteParam || totalParam) && (
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
            {totalParam && (
              <div className={`flex justify-between text-[14px] ${(items.length > 0 || noteParam) ? 'border-t border-border-col mt-1 pt-2' : ''}`}>
                <span className="font-bold text-text-dark">Total</span>
                <span className="font-bold text-text-dark">${totalParam}</span>
              </div>
            )}
          </div>
        )}

        {/* Deposit amount input */}
        <div>
          <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">
            Deposit Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-[14px]">$</span>
            <input
              type="number"
              min="1"
              max={totalParam ?? undefined}
              placeholder={totalParam ? `Enter amount (max $${totalParam})` : 'Enter amount'}
              value={depositInput}
              onChange={(e) => setDepositInput(e.target.value)}
              className="w-full border border-border-col rounded-[10px] pl-7 pr-3 py-2.5 text-[14px] text-text-dark outline-none focus:border-gold bg-white"
              autoFocus
            />
          </div>
          {depositInput !== '' && depositAmount > maxAmount && (
            <p className="text-red-500 text-[12px] mt-1">Cannot exceed total of ${totalParam}</p>
          )}
          {depositInput !== '' && depositAmount < 1 && (
            <p className="text-red-500 text-[12px] mt-1">Amount must be at least $1</p>
          )}
        </div>

        {error && <p className="text-red-500 text-[13px]">{error}</p>}

        <button
          onClick={() => void handlePay()}
          disabled={loading || !isValid || depositInput === ''}
          className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Redirecting…' : `Pay Deposit  $${depositAmount > 0 ? depositAmount : ''}`}
        </button>

        <p className="text-[11px] text-text-muted text-center">
          Your payment is processed securely by Stripe.<br />
          You will receive a confirmation email after payment.
        </p>
      </div>
    </div>
  )
}
