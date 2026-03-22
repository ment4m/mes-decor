import React, { useState, useEffect } from 'react'
import { fetchAllBookings, updateBookingStatus, deleteBooking, type Booking, type BookingStatus } from '../lib/airtable'

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

  const [bookings,  setBookings]  = useState<Booking[]>([])
  const [loading,   setLoading]   = useState(false)
  const [filter,    setFilter]    = useState<BookingStatus | 'All' | 'Completed'>('All')
  const [updating,  setUpdating]  = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

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
            <h1 className="text-text-dark text-[24px] font-bold">Bookings</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLoading(true); fetchAllBookings().then(setBookings).finally(() => setLoading(false)) }}
              className="px-4 py-2 bg-dark text-off-white text-[13px] font-semibold rounded-[10px] border-none cursor-pointer hover:bg-dark-deep transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-white text-text-dark text-[13px] font-semibold rounded-[10px] border border-border-col cursor-pointer hover:border-gold transition-colors"
            >
              ← Site
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {(['All', ...ALL_STATUSES, 'Completed'] as const).map((s) => {
            const count = s === 'All'       ? bookings.length
                        : s === 'Completed' ? bookings.filter((b) => isDatePassed(b.date)).length
                        : bookings.filter((b) => b.status === s && !isDatePassed(b.date)).length
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-[14px] px-4 py-3 text-left border transition-colors cursor-pointer ${filter === s ? 'bg-dark border-dark text-off-white' : 'bg-white border-border-col text-text-dark hover:border-gold'}`}
              >
                <p className="text-[22px] font-bold">{count}</p>
                <p className="text-[12px] opacity-70">{s}</p>
              </button>
            )
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted">Loading bookings…</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-text-muted bg-white rounded-[16px]">No bookings found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((b) => (
              <div key={b.id} className="bg-white rounded-[16px] px-5 py-4 shadow-sm flex flex-wrap items-center gap-4">

                {/* Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-text-dark text-[15px]">{b.name}</p>
                  <p className="text-text-muted text-[13px]">{b.phone}</p>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-text-dark text-[13px] font-semibold">{b.service}</p>
                  <p className="text-text-muted text-[12px]">{b.date} {b.time && `· ${b.time}`}</p>
                </div>

                {/* Status badge */}
                <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${STATUS_COLORS[isDatePassed(b.date) ? 'Completed' : b.status]}`}>
                  {isDatePassed(b.date) ? 'Completed' : b.status}
                </span>

                {/* Status update buttons — only for future bookings */}
                {!isDatePassed(b.date) && (
                  <div className="flex gap-2 flex-wrap">
                    {ALL_STATUSES.filter((s) => s !== b.status).map((s) => (
                      <button
                        key={s}
                        disabled={updating === b.id}
                        onClick={() => void handleStatus(b.id, s)}
                        className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-border-col bg-white text-text-dark cursor-pointer hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
                      >
                        {updating === b.id ? '…' : `→ ${s}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add to Google Calendar — only for upcoming bookings */}
                {b.date && !isDatePassed(b.date) && (
                  <a
                    href={calendarUrl(b)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-blue-200 bg-white text-blue-500 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors no-underline whitespace-nowrap"
                  >
                    + Calendar
                  </a>
                )}

                {/* Delete */}
                {confirmDel === b.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-[12px] text-red-500 font-semibold">Delete?</span>
                    <button
                      onClick={() => void handleDelete(b.id)}
                      className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold bg-red-500 text-white border-none cursor-pointer hover:bg-red-600 transition-colors"
                    >Yes</button>
                    <button
                      onClick={() => setConfirmDel(null)}
                      className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-border-col bg-white text-text-dark cursor-pointer hover:border-gold transition-colors"
                    >No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDel(b.id)}
                    className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border border-red-200 bg-white text-red-400 cursor-pointer hover:bg-red-50 hover:border-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
