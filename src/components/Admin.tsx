import React, { useState, useEffect } from 'react'
import { fetchAllBookings, updateBookingStatus, deleteBooking, createBooking, fetchAllReviews, updateReviewStatus, updateReviewImage, type Booking, type BookingStatus, type Review } from '../lib/airtable'
import { RENTAL_ITEMS } from './Experience'

const STATUS_COLORS: Record<BookingStatus | 'Completed', string> = {
  Pending:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  Reserved:  'bg-green-100 text-green-800 border-green-300',
  Cancelled: 'bg-red-100 text-red-800 border-red-300',
  Completed: 'bg-blue-100 text-blue-800 border-blue-300',
}

const ALL_STATUSES: BookingStatus[] = ['Pending', 'Reserved', 'Cancelled']

function isDatePassed(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  d.setHours(23, 59, 59, 999)
  return d < new Date()
}

function calendarUrl(b: Booking): string {
  const d = new Date(b.date)
  const pad = (n: number) => String(n).padStart(2, '0')
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const text = encodeURIComponent(`Mes Decor – ${b.service}`)
  const details = encodeURIComponent(`Customer: ${b.name}\nPhone: ${b.phone}\nTime: ${b.time}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${ymd}/${ymd}&details=${details}`
}

export default function Admin(): React.ReactElement {
  const [authed,   setAuthed]   = useState(false)
  const [password, setPassword] = useState('')
  const [pwError,  setPwError]  = useState(false)

  const [tab,       setTab]       = useState<'bookings' | 'reviews' | 'items'>('bookings')

  const [bookings,  setBookings]  = useState<Booking[]>([])
  const [loading,   setLoading]   = useState(false)
  const [filter,    setFilter]    = useState<BookingStatus | 'All' | 'Completed'>('All')
  const [updating,  setUpdating]  = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [showAdd,    setShowAdd]    = useState(false)
  const [addForm,    setAddForm]    = useState({ name: '', phone: '', serviceType: '', serviceDetail: '', date: '', time: '', status: 'Pending' as BookingStatus })
  const [addLoading, setAddLoading] = useState(false)

  const [reviews,        setReviews]        = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewUpdating, setReviewUpdating] = useState<string | null>(null)
  const [reviewFilter,   setReviewFilter]   = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending')

  const [linkModal,  setLinkModal]  = useState<Booking | null>(null)
  const [linkAmount, setLinkAmount] = useState<string>('')
  const [linkItem,   setLinkItem]   = useState<string>('')
  const [linkCopied, setLinkCopied] = useState(false)

  // Items tab state
  const [selectedKeys,    setSelectedKeys]    = useState<string[]>([])
  const [itemLinkAmount,  setItemLinkAmount]  = useState<string>('')
  const [showItemLink,      setShowItemLink]      = useState(false)
  const [itemLinkCopied,    setItemLinkCopied]    = useState(false)
  const [reviewLinkCopied,  setReviewLinkCopied]  = useState(false)

  const toggleItemKey = (key: string): void => {
    setSelectedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      const autoTotal = next.reduce((sum, k) => {
        const ri = RENTAL_ITEMS.find((r) => r.key === k)
        if (!ri) return sum
        return sum + ri.fullPrice * (ri.unit === 'chair' ? (ri.minQty ?? 1) : 1)
      }, 0)
      setItemLinkAmount(autoTotal > 0 ? String(autoTotal) : '')
      return next
    })
  }

  const buildItemPayLink = (amount: string): string => {
    const base   = window.location.origin
    const params = new URLSearchParams()
    selectedKeys.forEach((key) => {
      const ri = RENTAL_ITEMS.find((r) => r.key === key)
      if (ri) { params.append('item', ri.name); params.append('image', ri.images[0]) }
    })
    if (amount) params.set('total', amount)
    return `${base}/pay?${params.toString()}`
  }

  const copyItemLink = (): void => {
    void navigator.clipboard.writeText(buildItemPayLink(itemLinkAmount))
    setItemLinkCopied(true)
    setTimeout(() => setItemLinkCopied(false), 2000)
  }

  const buildItemReviewLink = (): string => {
    const base   = window.location.origin
    const params = new URLSearchParams()
    const first  = RENTAL_ITEMS.find((r) => r.key === selectedKeys[0])
    if (first) { params.set('item', first.name); params.set('image', first.images[0]) }
    return `${base}/review?${params.toString()}`
  }

  const copyReviewLink = (): void => {
    void navigator.clipboard.writeText(buildItemReviewLink())
    setReviewLinkCopied(true)
    setTimeout(() => setReviewLinkCopied(false), 2000)
  }

  const buildPayLink = (b: Booking, amount: string, itemName: string): string => {
    const base      = window.location.origin
    const params    = new URLSearchParams({ item: itemName || b.service })
    if (amount) params.set('total', amount)
    const matched = RENTAL_ITEMS.find((r) => r.name === itemName)
    if (matched) params.set('image', matched.images[0])
    return `${base}/pay?${params.toString()}`
  }

  const copyLink = (b: Booking): void => {
    void navigator.clipboard.writeText(buildPayLink(b, linkAmount, linkItem))
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleAdd = async (): Promise<void> => {
    if (!addForm.name || !addForm.phone || !addForm.serviceType || !addForm.date) return
    setAddLoading(true)
    const service = addForm.serviceDetail ? `${addForm.serviceType} – ${addForm.serviceDetail}` : addForm.serviceType
    const newBooking = await createBooking({ ...addForm, service })
    setBookings((prev) => [newBooking, ...prev])
    setShowAdd(false)
    setAddForm({ name: '', phone: '', serviceType: '', serviceDetail: '', date: '', time: '', status: 'Pending' })
    setAddLoading(false)
  }

  const login = async (): Promise<void> => {
    const res  = await fetch('/.netlify/functions/admin-auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password }),
    })
    if (res.ok) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    fetchAllBookings()
      .then(setBookings)
      .finally(() => setLoading(false))
  }, [authed])

  useEffect(() => {
    if (!authed || tab !== 'reviews') return
    setReviewsLoading(true)
    fetchAllReviews()
      .then(setReviews)
      .finally(() => setReviewsLoading(false))
  }, [authed, tab])

  const [reviewError, setReviewError] = useState<string>('')

  const handleReviewStatus = async (id: string, status: 'Approved' | 'Rejected'): Promise<void> => {
    setReviewUpdating(id)
    setReviewError('')
    try {
      // Airtable only has Pending/Approved — Rejected maps back to Pending
      const airtableStatus = status === 'Rejected' ? 'Pending' : status
      await updateReviewStatus(id, airtableStatus)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: airtableStatus } : r))
    } catch (err) {
      setReviewError((err as Error).message)
    } finally {
      setReviewUpdating(null)
    }
  }

  const handleReviewImage = async (id: string, image: string): Promise<void> => {
    try {
      await updateReviewImage(id, image)
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, image } : r))
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string): Promise<void> => {
    await deleteBooking(id)
    setBookings((prev) => prev.filter((b) => b.id !== id))
    setConfirmDel(null)
  }

  const handleStatus = async (id: string, status: BookingStatus): Promise<void> => {
    setUpdating(id)
    await updateBookingStatus(id, status)
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    setUpdating(null)
  }

  const displayed = filter === 'All'       ? bookings
                  : filter === 'Completed' ? bookings.filter((b) => isDatePassed(b.date))
                  : bookings.filter((b) => b.status === filter && !isDatePassed(b.date))

  // ── Login screen ──────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gold flex items-center justify-center px-4">
        <div className="bg-off-white rounded-[20px] w-full max-w-[360px] overflow-hidden shadow-2xl">
          <div className="bg-dark px-6 py-6 text-center">
            <p className="text-gold font-bold text-[13px] uppercase tracking-widest mb-1">Mes Decor</p>
            <h1 className="text-off-white text-[20px] font-bold">Admin Dashboard</h1>
          </div>
          <div className="px-6 py-6 flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') void login() }}
                className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[14px] text-text-dark outline-none focus:border-gold bg-white"
                placeholder="Enter admin password"
                autoFocus
              />
              {pwError && <p className="text-red-500 text-[12px] mt-1.5">Incorrect password</p>}
            </div>
            <button
              onClick={() => void login()}
              className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-8">
      <div className="max-w-[1000px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-gold font-bold text-[12px] uppercase tracking-widest">Mes Decor</p>
            <h1 className="text-text-dark text-[24px] font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'bookings' && (
              <>
                <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-gold text-off-white text-[13px] font-semibold rounded-[10px] border-none cursor-pointer hover:bg-gold-dark transition-colors">+ Add Booking</button>
                <button onClick={() => { setLoading(true); fetchAllBookings().then(setBookings).finally(() => setLoading(false)) }} className="px-4 py-2 bg-dark text-off-white text-[13px] font-semibold rounded-[10px] border-none cursor-pointer hover:bg-dark-deep transition-colors">Refresh</button>
              </>
            )}
            {tab === 'reviews' && (
              <button onClick={() => { setReviewsLoading(true); fetchAllReviews().then(setReviews).finally(() => setReviewsLoading(false)) }} className="px-4 py-2 bg-dark text-off-white text-[13px] font-semibold rounded-[10px] border-none cursor-pointer hover:bg-dark-deep transition-colors">Refresh</button>
            )}
            <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-white text-text-dark text-[13px] font-semibold rounded-[10px] border border-border-col cursor-pointer hover:border-gold transition-colors">← Site</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('bookings')} className={`px-5 py-2 rounded-[10px] text-[13px] font-semibold border transition-colors cursor-pointer ${tab === 'bookings' ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}>Bookings</button>
          <button onClick={() => setTab('reviews')}  className={`px-5 py-2 rounded-[10px] text-[13px] font-semibold border transition-colors cursor-pointer ${tab === 'reviews'  ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}>Reviews</button>
          <button onClick={() => setTab('items')}    className={`px-5 py-2 rounded-[10px] text-[13px] font-semibold border transition-colors cursor-pointer ${tab === 'items'    ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}>Send Link</button>
        </div>

        {/* ── Bookings Tab ── */}
        {tab === 'bookings' && (
          <>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {(['All', ...ALL_STATUSES, 'Completed'] as const).map((s) => {
                const count = s === 'All'       ? bookings.length
                            : s === 'Completed' ? bookings.filter((b) => isDatePassed(b.date)).length
                            : bookings.filter((b) => b.status === s && !isDatePassed(b.date)).length
                return (
                  <button key={s} onClick={() => setFilter(s)} className={`rounded-[14px] px-4 py-3 text-left border transition-colors cursor-pointer ${filter === s ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}>
                    <p className="text-[22px] font-bold">{count}</p>
                    <p className="text-[12px] opacity-70">{s}</p>
                  </button>
                )
              })}
            </div>

            {loading ? (
              <div className="text-center py-16 text-text-muted">Loading bookings…</div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16 text-text-muted bg-white rounded-[16px]">No bookings found.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayed.map((b) => (
                  <div key={b.id} className="bg-white rounded-[16px] px-5 py-4 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-bold text-text-dark text-[15px]">{b.name}</p>
                      <p className="text-text-muted text-[13px]">{b.phone}</p>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-text-dark text-[13px] font-semibold">{b.service}</p>
                      <p className="text-text-muted text-[12px]">{b.date} {b.time && `· ${b.time}`}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${STATUS_COLORS[isDatePassed(b.date) ? 'Completed' : b.status]}`}>
                      {isDatePassed(b.date) ? 'Completed' : b.status}
                    </span>
                    {!isDatePassed(b.date) && (
                      <div className="flex gap-2 flex-wrap">
                        {ALL_STATUSES.filter((s) => s !== b.status).map((s) => (
                          <button key={s} disabled={updating === b.id} onClick={() => void handleStatus(b.id, s)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-border-col bg-white text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors disabled:opacity-50">
                            {updating === b.id ? '…' : `→ ${s}`}
                          </button>
                        ))}
                      </div>
                    )}
                    {b.date && !isDatePassed(b.date) && (
                      <a href={calendarUrl(b)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-blue-200 bg-white text-blue-500 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors no-underline whitespace-nowrap">+ Calendar</a>
                    )}
                    <button
                      onClick={() => { setLinkModal(b); setLinkAmount(''); setLinkItem(''); setLinkCopied(false) }}
                      className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-gold bg-white text-gold cursor-pointer hover:bg-gold hover:text-off-white transition-colors whitespace-nowrap"
                    >
                      Send Link
                    </button>

                    {confirmDel === b.id ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-[12px] text-red-500 font-semibold">Delete?</span>
                        <button onClick={() => void handleDelete(b.id)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold bg-red-500 text-white border-none cursor-pointer hover:bg-red-600 transition-colors">Yes</button>
                        <button onClick={() => setConfirmDel(null)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-border-col bg-white text-text-dark cursor-pointer hover:border-gold transition-colors">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(b.id)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-red-200 bg-white text-red-400 cursor-pointer hover:bg-red-50 hover:border-red-400 transition-colors">Delete</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Reviews Tab ── */}
        {tab === 'reviews' && (
          <>
            {reviewsLoading ? (
              <div className="text-center py-16 text-text-muted">Loading reviews…</div>
            ) : (
              <>
                {/* Filter pills */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((f) => {
                    const count = f === 'All' ? reviews.length : reviews.filter((r) => (r.status ?? 'Pending') === f).length
                    return (
                      <button
                        key={f}
                        onClick={() => setReviewFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-colors cursor-pointer ${reviewFilter === f ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}
                      >
                        {f} ({count})
                      </button>
                    )
                  })}
                </div>

                {reviewError && (
                  <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 text-red-600 text-[13px]">
                    {reviewError} — check that "Rejected" is a valid option in your Airtable Status field.
                  </div>
                )}

                {/* Review cards */}
                {(reviewFilter === 'All' ? reviews : reviews.filter((r) => (r.status ?? 'Pending') === reviewFilter)).length === 0 ? (
                  <div className="text-center py-16 text-text-muted bg-white rounded-[16px]">No {reviewFilter.toLowerCase()} reviews.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(reviewFilter === 'All' ? reviews : reviews.filter((r) => (r.status ?? 'Pending') === reviewFilter)).map((r) => (
                      <div key={r.id} className="bg-white rounded-[16px] shadow-sm border border-border-col overflow-hidden">
                        {/* Top row */}
                        <div className="px-5 py-4 flex flex-wrap items-start gap-4">
                          <div className="flex gap-0.5 flex-shrink-0 pt-0.5">
                            {[1,2,3,4,5].map((n) => (
                              <span key={n} className={`text-lg ${n <= r.rating ? 'text-gold' : 'text-border-col'}`}>★</span>
                            ))}
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <p className="font-bold text-text-dark text-[14px]">{r.name}</p>
                            <p className="text-text-muted text-[13px] mt-0.5">"{r.comment}"</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[12px] font-bold border flex-shrink-0 ${r.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-300' : r.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                            {r.status ?? 'Pending'}
                          </span>
                          {r.status !== 'Approved' && (
                            <button disabled={reviewUpdating === r.id} onClick={() => void handleReviewStatus(r.id, 'Approved')} className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-green-200 bg-white text-green-600 cursor-pointer hover:bg-green-50 hover:border-green-400 transition-colors disabled:opacity-50 flex-shrink-0">
                              {reviewUpdating === r.id ? '…' : 'Approve'}
                            </button>
                          )}
                          {r.status !== 'Rejected' && (
                            <button disabled={reviewUpdating === r.id} onClick={() => void handleReviewStatus(r.id, 'Rejected')} className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-red-200 bg-white text-red-400 cursor-pointer hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 flex-shrink-0">
                              {reviewUpdating === r.id ? '…' : 'Reject'}
                            </button>
                          )}
                        </div>
                        {/* Image picker */}
                        <div className="border-t border-border-col px-5 py-3 bg-cream">
                          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Select Image to Show With Review</p>
                          <div className="flex gap-2 flex-wrap">
                            {RENTAL_ITEMS.map((ri) => (
                              <button
                                key={ri.key}
                                onClick={() => void handleReviewImage(r.id, r.image === ri.images[0] ? '' : ri.images[0])}
                                className={`rounded-[8px] overflow-hidden border-2 transition-all cursor-pointer p-0 ${r.image === ri.images[0] ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              >
                                <img src={ri.images[0]} alt={ri.name} className="w-16 h-12 object-cover block" />
                              </button>
                            ))}
                            {r.image && (
                              <button
                                onClick={() => void handleReviewImage(r.id, '')}
                                className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold border border-border-col bg-white text-text-muted cursor-pointer hover:border-red-300 hover:text-red-400 transition-colors self-center"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Items / Send Payment Tab ── */}
        {tab === 'items' && (
          <div className="flex flex-col gap-6">

            {/* Item grid */}
            <div>
              <p className="text-[13px] text-text-muted mb-4">Select one or more items to include in the payment link. Click an item to select or deselect it.</p>
              <div className="grid grid-cols-3 mob:grid-cols-1 gap-4">
                {RENTAL_ITEMS.map((ri) => {
                  const selected = selectedKeys.includes(ri.key)
                  return (
                    <button
                      key={ri.key}
                      onClick={() => toggleItemKey(ri.key)}
                      className={`rounded-[16px] overflow-hidden border-2 transition-all cursor-pointer p-0 text-left shadow-sm ${selected ? 'border-gold' : 'border-transparent hover:border-gold/40'}`}
                    >
                      <div className="relative">
                        <img src={ri.images[0]} alt={ri.name} className="w-full h-[160px] object-cover block" />
                        {selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                            <span className="text-white text-[12px] font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-2.5 ${selected ? 'bg-gold' : 'bg-white'}`}>
                        <p className={`text-[13px] font-bold ${selected ? 'text-off-white' : 'text-text-dark'}`}>{ri.name}</p>
                        <p className={`text-[12px] ${selected ? 'text-white/80' : 'text-text-muted'}`}>
                          {ri.unit === 'chair' ? `$${ri.fullPrice}/chair` : `$${ri.fullPrice}`}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Link builder — only shown when items selected */}
            {selectedKeys.length > 0 && (
              <div className="bg-white rounded-[16px] border border-border-col px-5 py-5 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-text-dark">Generate Payment Link</p>
                  <span className="text-[12px] text-gold font-semibold">{selectedKeys.length} item{selectedKeys.length > 1 ? 's' : ''} selected</span>
                </div>

                {/* Total amount */}
                <div>
                  <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Rental Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-[14px]">$</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 300"
                      value={itemLinkAmount}
                      onChange={(e) => setItemLinkAmount(e.target.value)}
                      className="w-full border border-border-col rounded-[10px] pl-7 pr-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">Auto-calculated from selected items. You can adjust before sending.</p>
                </div>

                {/* Link preview */}
                <div className="bg-cream rounded-[10px] px-3 py-2.5">
                  <p className="text-[11px] text-text-muted break-all">{buildItemPayLink(itemLinkAmount)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={copyItemLink}
                    className={`flex-1 py-2.5 rounded-pill font-semibold text-[13px] border-none cursor-pointer transition-colors ${itemLinkCopied ? 'bg-green-500 text-white' : 'bg-gold text-off-white hover:bg-gold-dark'}`}
                  >
                    {itemLinkCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Here is your payment link: ${buildItemPayLink(itemLinkAmount)}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-pill font-semibold text-[13px] bg-[#25D366] text-white cursor-pointer hover:bg-[#1ebe5d] transition-colors no-underline text-center"
                  >
                    Send via WhatsApp
                  </a>
                </div>

                {/* Show ItemLink modal toggle */}
                {showItemLink && (
                  <a
                    href={buildItemPayLink(itemLinkAmount)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-gold underline text-center"
                  >
                    Preview payment page ↗
                  </a>
                )}
                <button
                  onClick={() => setShowItemLink(!showItemLink)}
                  className="text-[12px] text-gold underline bg-transparent border-none cursor-pointer p-0 text-center"
                >
                  {showItemLink ? 'Hide preview link' : 'Preview payment page ↗'}
                </button>
              </div>
            )}

            {/* ── Send Review Link ── */}
            {selectedKeys.length > 0 && (
              <div className="bg-white rounded-[16px] border border-border-col px-5 py-5 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-text-dark">Send Review Link</p>
                  <span className="text-[12px] text-text-muted">Uses first selected item</span>
                </div>

                {/* Image preview */}
                {RENTAL_ITEMS.find((r) => r.key === selectedKeys[0]) && (() => {
                  const ri = RENTAL_ITEMS.find((r) => r.key === selectedKeys[0])!
                  return (
                    <div className="flex items-center gap-3">
                      <img src={ri.images[0]} alt={ri.name} className="w-16 h-12 object-cover rounded-[8px] border border-border-col flex-shrink-0" />
                      <p className="text-[13px] font-semibold text-text-dark">{ri.name}</p>
                    </div>
                  )
                })()}

                {/* Link preview */}
                <div className="bg-cream rounded-[10px] px-3 py-2.5">
                  <p className="text-[11px] text-text-muted break-all">{buildItemReviewLink()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={copyReviewLink}
                    className={`flex-1 py-2.5 rounded-pill font-semibold text-[13px] border-none cursor-pointer transition-colors ${reviewLinkCopied ? 'bg-green-500 text-white' : 'bg-dark text-off-white hover:bg-[#2a1f14]'}`}
                  >
                    {reviewLinkCopied ? 'Copied!' : 'Copy Review Link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`We'd love your feedback! Leave us a review here: ${buildItemReviewLink()}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-pill font-semibold text-[13px] bg-[#25D366] text-white cursor-pointer hover:bg-[#1ebe5d] transition-colors no-underline text-center"
                  >
                    Send via WhatsApp
                  </a>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Send Payment Link Modal */}
      {linkModal && (
        <div className="fixed inset-0 bg-[rgba(20,12,4,0.75)] backdrop-blur-sm z-[500] flex items-center justify-center p-4" onClick={() => setLinkModal(null)}>
          <div className="bg-off-white rounded-[20px] w-full max-w-[400px] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-dark px-6 py-5 flex items-center justify-between">
              <h3 className="text-off-white font-bold text-[17px]">Send Payment Link</h3>
              <button className="bg-white/10 border-none text-off-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => setLinkModal(null)}>✕</button>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">

              {/* Customer info */}
              <div className="bg-cream rounded-[12px] px-4 py-3 flex flex-col gap-1">
                <p className="text-[12px] text-text-muted font-semibold uppercase tracking-wider">Customer</p>
                <p className="text-[14px] font-bold text-text-dark">{linkModal.name}</p>
                <p className="text-[13px] text-text-muted">{linkModal.service}</p>
              </div>

              {/* Item picker */}
              <div>
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-2">Select Item</label>
                <div className="grid grid-cols-3 gap-2">
                  {RENTAL_ITEMS.map((ri) => (
                    <button
                      key={ri.key}
                      onClick={() => setLinkItem(linkItem === ri.name ? '' : ri.name)}
                      className={`rounded-[12px] overflow-hidden border-2 transition-all cursor-pointer p-0 text-left ${linkItem === ri.name ? 'border-gold' : 'border-transparent'}`}
                    >
                      <img src={ri.images[0]} alt={ri.name} className="w-full h-16 object-cover block" />
                      <p className={`text-[11px] font-semibold px-2 py-1.5 leading-tight ${linkItem === ri.name ? 'bg-gold text-off-white' : 'bg-white text-text-dark'}`}>{ri.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total amount */}
              <div>
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Total Amount (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-semibold text-[14px]">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 300"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                    className="w-full border border-border-col rounded-[10px] pl-7 pr-3 py-2.5 text-[14px] text-text-dark outline-none focus:border-gold bg-white"
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1">Customer cannot pay more than this. Leave blank for any amount.</p>
              </div>

              {/* Link preview */}
              <div className="bg-cream rounded-[10px] px-3 py-2.5">
                <p className="text-[11px] text-text-muted break-all">{buildPayLink(linkModal, linkAmount, linkItem)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => copyLink(linkModal)}
                  className={`flex-1 py-2.5 rounded-pill font-semibold text-[13px] border-none cursor-pointer transition-colors ${linkCopied ? 'bg-green-500 text-white' : 'bg-gold text-off-white hover:bg-gold-dark'}`}
                >
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`https://wa.me/${linkModal.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${linkModal.name}, here is your payment link: ${buildPayLink(linkModal, linkAmount, linkItem)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-pill font-semibold text-[13px] bg-[#25D366] text-white cursor-pointer hover:bg-[#1ebe5d] transition-colors no-underline text-center"
                >
                  Send via WhatsApp
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-[rgba(20,12,4,0.75)] backdrop-blur-sm z-[500] flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-off-white rounded-[20px] w-full max-w-[420px] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-dark px-6 py-5 flex items-center justify-between">
              <h3 className="text-off-white font-bold text-[17px]">Add Booking</h3>
              <button className="bg-white/10 border-none text-off-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">
              {[
                { label: 'Full Name *', field: 'name',  type: 'text', placeholder: 'Customer name' },
                { label: 'Phone *',     field: 'phone', type: 'tel',  placeholder: '+1 234 567 8900' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} value={addForm[field as keyof typeof addForm]} onChange={(e) => setAddForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white" />
                </div>
              ))}
              <div>
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1">Service Type *</label>
                <select value={addForm.serviceType} onChange={(e) => setAddForm((f) => ({ ...f, serviceType: e.target.value, serviceDetail: '' }))} className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white">
                  <option value="">Select service type</option>
                  <option value="Event Decor">Event Decor</option>
                  <option value="Rental">Rental</option>
                </select>
              </div>
              {addForm.serviceType === 'Event Decor' && (
                <div>
                  <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1">Event Category</label>
                  <select value={addForm.serviceDetail} onChange={(e) => setAddForm((f) => ({ ...f, serviceDetail: e.target.value }))} className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white">
                    <option value="">Select category</option>
                    {['Birthday', 'Baby Shower', 'Christening', 'Graduation', 'Others'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {addForm.serviceType === 'Rental' && (
                <div>
                  <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1">Rental Item</label>
                  <select value={addForm.serviceDetail} onChange={(e) => setAddForm((f) => ({ ...f, serviceDetail: e.target.value }))} className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white">
                    <option value="">Select item</option>
                    {['Serpentine Table', 'Chiavari Chairs', 'Grad Marquee Letters'].map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              )}
              {[
                { label: 'Date *', field: 'date', type: 'date' },
                { label: 'Time',   field: 'time', type: 'time' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1">{label}</label>
                  <input type={type} value={addForm[field as keyof typeof addForm]} onChange={(e) => setAddForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white" />
                </div>
              ))}
              <div>
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wider block mb-1">Status</label>
                <select value={addForm.status} onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value as BookingStatus }))} className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[13px] text-text-dark outline-none focus:border-gold bg-white">
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => void handleAdd()} disabled={addLoading || !addForm.name || !addForm.phone || !addForm.serviceType || !addForm.date} className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors disabled:opacity-50">
                {addLoading ? 'Saving…' : 'Add Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
