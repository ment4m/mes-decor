import React, { useState } from 'react'

// ── Types ──────────────────────────────────────────────────
interface Props {
  initialDate:   string        // YYYY-MM-DD or ''
  initialTime:   string        // HH:MM (24h)
  reservedDates: string[]      // YYYY-MM-DD dates blocked as reserved
  onConfirm: (date: string, time: string) => void
  onCancel: () => void
}

// ── Constants ──────────────────────────────────────────────
const WEEKDAYS: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MONTHS: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Time slots: every 30 min, 8:00 AM → 8:00 PM
const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m === 30) break
      const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      const min  = m === 0 ? '00' : '30'
      slots.push(`${h12}:${min} ${ampm}`)
    }
  }
  return slots
})()

// ── Helpers ────────────────────────────────────────────────
const toDisplayTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

const to24h = (display: string): string => {
  const [time, ampm] = display.split(' ')
  const [h, m]       = time.split(':').map(Number)
  let hour24         = h
  if (ampm === 'PM' && h !== 12) hour24 = h + 12
  if (ampm === 'AM' && h === 12) hour24 = 0
  return `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ── Component ──────────────────────────────────────────────
export default function DateTimePicker({
  initialDate,
  initialTime,
  reservedDates,
  onConfirm,
  onCancel,
}: Props): React.ReactElement {
  const today    = new Date()
  const initDate = initialDate ? new Date(initialDate + 'T12:00:00') : today

  const [viewYear,     setViewYear]     = useState<number>(initDate.getFullYear())
  const [viewMonth,    setViewMonth]    = useState<number>(initDate.getMonth())
  const [selectedDay,  setSelectedDay]  = useState<number | null>(initialDate ? initDate.getDate() : null)
  const [selectedTime, setSelectedTime] = useState<string>(
    initialTime ? toDisplayTime(initialTime) : '9:00 AM'
  )

  // ── Calendar grid ──
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate()
  const rawFirstDay   = new Date(viewYear, viewMonth, 1).getDay()          // 0=Sun
  const firstDayOff   = rawFirstDay === 0 ? 6 : rawFirstDay - 1           // Monday-start

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOff).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const isToday = (day: number): boolean =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear  === today.getFullYear()

  const isPast = (day: number): boolean => {
    const d = new Date(viewYear, viewMonth, day)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return d < t
  }

  const isReserved = (day: number): boolean => {
    const month = String(viewMonth + 1).padStart(2, '0')
    const d     = String(day).padStart(2, '0')
    return reservedDates.includes(`${viewYear}-${month}-${d}`)
  }

  // ── Month navigation ──
  const prevMonth = (): void => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
    setSelectedDay(null)
  }

  const nextMonth = (): void => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
    setSelectedDay(null)
  }

  // ── Confirm ──
  const handleConfirm = (): void => {
    if (!selectedDay) return
    const month   = String(viewMonth + 1).padStart(2, '0')
    const day     = String(selectedDay).padStart(2, '0')
    const dateStr = `${viewYear}-${month}-${day}`
    onConfirm(dateStr, to24h(selectedTime))
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="dtp-overlay" onClick={onCancel}>
      <div className="dtp-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>

        <p className="dtp-label">Event Date &amp; Time*</p>

        {/* Month nav */}
        <div className="dtp-month-nav">
          <span className="dtp-month-title">{MONTHS[viewMonth]} {viewYear}</span>
          <div className="dtp-arrows">
            <button className="dtp-arrow" onClick={prevMonth} aria-label="Previous month">‹</button>
            <button className="dtp-arrow" onClick={nextMonth} aria-label="Next month">›</button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="dtp-weekdays">
          {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        </div>

        {/* Day grid */}
        <div className="dtp-days">
          {cells.map((day, i) => (
            <button
              key={i}
              className={[
                'dtp-day',
                day === null                ? 'dtp-day--empty'    : '',
                day && selectedDay === day  ? 'dtp-day--selected' : '',
                day && isToday(day)         ? 'dtp-day--today'    : '',
                day && isPast(day)          ? 'dtp-day--past'     : '',
                day && isReserved(day)      ? 'dtp-day--reserved' : '',
              ].join(' ').trim()}
              disabled={!day || isPast(day) || isReserved(day)}
              onClick={() => day && setSelectedDay(day)}
            >
              {day ?? ''}
            </button>
          ))}
        </div>

        {/* Timezone */}
        <p className="dtp-timezone">{timezone}</p>

        {/* Time slots */}
        <div className="dtp-times">
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              className={`dtp-time${selectedTime === t ? ' dtp-time--selected' : ''}`}
              onClick={() => setSelectedTime(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <hr className="dtp-divider" />

        {/* Actions */}
        <div className="dtp-actions">
          <button className="dtp-btn-cancel"   onClick={onCancel}>Cancel</button>
          <button className="dtp-btn-schedule" onClick={handleConfirm} disabled={!selectedDay}>
            Schedule
          </button>
        </div>

      </div>
    </div>
  )
}
