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
    /* Overlay */
    <div
      className="fixed inset-0 bg-[rgba(30,21,8,0.55)] backdrop-blur-[4px] z-[200] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Modal card */}
      <div
        className="bg-cream rounded-[20px] px-7 mob:px-4 pt-7 mob:pt-5 pb-[22px] mob:pb-4 w-full max-w-[460px] shadow-[0_24px_64px_rgba(30,21,8,0.30)]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Label */}
        <p className="text-[12px] font-semibold text-text-muted tracking-[0.5px] uppercase mb-[14px]">
          Event Date &amp; Time*
        </p>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-[18px]">
          <span className="text-[20px] mob:text-[17px] font-bold text-text-dark tracking-[-0.5px]">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <div className="flex gap-[6px]">
            <button
              className="w-[34px] h-[34px] rounded-full border border-border-col bg-off-white text-text-dark text-[18px] leading-none cursor-pointer flex items-center justify-center transition-colors hover:bg-gold hover:border-gold hover:text-off-white"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              className="w-[34px] h-[34px] rounded-full border border-border-col bg-off-white text-text-dark text-[18px] leading-none cursor-pointer flex items-center justify-center transition-colors hover:bg-gold hover:border-gold hover:text-off-white"
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center mb-2">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[12px] font-semibold text-text-muted py-1 tracking-[0.3px]">
              {d}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-[2px] mb-5">
          {cells.map((day, i) => {
            const empty    = day === null
            const selected = Boolean(day && selectedDay === day)
            const past     = Boolean(day && isPast(day))
            const reserved = Boolean(day && isReserved(day))
            const todayDay = Boolean(day && isToday(day))

            const dayCls = [
              // base
              'aspect-square rounded-full border-none text-[13.5px] font-medium cursor-pointer transition-[background,color] flex items-center justify-center p-0',
              // empty / past → invisible
              empty || past ? 'opacity-0 pointer-events-none' : '',
              // selected
              selected ? 'bg-gold text-off-white font-bold' : '',
              // today (not selected)
              todayDay && !selected ? 'border border-[1.5px] border-gold text-gold' : '',
              // reserved
              reserved ? 'bg-[#f3e6e6] text-[#c0392b] line-through cursor-not-allowed opacity-60' : '',
              // default hover (not disabled, not selected, not reserved)
              !selected && !reserved && !empty && !past ? 'hover:bg-ivory text-text-dark' : '',
            ].filter(Boolean).join(' ')

            return (
              <button
                key={i}
                className={dayCls}
                disabled={!day || isPast(day) || isReserved(day)}
                onClick={() => day && setSelectedDay(day)}
              >
                {day ?? ''}
              </button>
            )
          })}
        </div>

        {/* Timezone */}
        <p className="text-[12px] text-text-muted font-semibold tracking-[0.3px] mb-[10px]">
          {timezone}
        </p>

        {/* Time slots */}
        <div className="grid grid-cols-3 gap-2 mob:gap-[6px] max-h-[160px] overflow-y-auto mb-5 pr-[2px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-col [&::-webkit-scrollbar-thumb]:rounded">
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              className={`py-[9px] mob:py-2 px-[6px] mob:px-1 rounded-[10px] border text-[13px] mob:text-[12px] font-medium cursor-pointer text-center transition-all ${
                selectedTime === t
                  ? 'bg-gold border-gold text-off-white font-semibold'
                  : 'bg-off-white border-border-col text-text-dark hover:border-gold-light hover:bg-ivory'
              }`}
              onClick={() => setSelectedTime(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Divider */}
        <hr className="border-none border-t border-border-col mb-4" />

        {/* Actions */}
        <div className="flex gap-[10px] justify-end">
          <button
            className="px-6 py-[11px] rounded-pill border border-border-col bg-off-white text-text-mid text-[14px] font-medium cursor-pointer transition-colors hover:bg-ivory"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-7 py-[11px] rounded-pill border-none bg-gold text-off-white text-[14px] font-semibold cursor-pointer transition-colors hover:bg-gold-dark disabled:opacity-45 disabled:cursor-default"
            onClick={handleConfirm}
            disabled={!selectedDay}
          >
            Schedule
          </button>
        </div>

      </div>
    </div>
  )
}
