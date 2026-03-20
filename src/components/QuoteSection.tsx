import React, { useState, useEffect } from 'react'
import { WhatsApp, Instagram } from './icons'
import DateTimePicker from './DateTimePicker'
import { submitBooking, fetchReservedDates } from '../lib/airtable'

type ServiceType  = '' | 'Rental' | 'Event Decor'
type DeliveryType = '' | 'Drop-off' | 'Pick-up'

interface BookingForm {
  fullName:      string
  phone:         string
  time:          string
  date:          string
  serviceType:   ServiceType
  deliveryType:  DeliveryType
  zipCode:       string
  eventCategory: string
}

const EVENT_CATEGORIES: string[] = [
  'Wedding', 'Baby Shower', 'Birthday', 'Graduation', 'Christening', 'Others',
]

const SOCIAL_LINKS = [
  { Icon: WhatsApp,  label: 'WhatsApp',  href: 'https://wa.me/19723755225'          },
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/decorbymessi' },
]

const formatDateTimeDisplay = (date: string, time: string): string => {
  if (!date) return 'Select date & time'
  const d       = new Date(date + 'T12:00:00')
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const [h, m]  = time.split(':').map(Number)
  const ampm    = h < 12 ? 'AM' : 'PM'
  const h12     = h % 12 || 12
  return `${dateStr}  ·  ${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function QuoteSection(): React.ReactElement {
  const [showPicker,    setShowPicker]    = useState<boolean>(false)
  const [reservedDates, setReservedDates] = useState<string[]>([])
  const [form, setForm] = useState<BookingForm>({
    fullName: '', phone: '', time: '09:00', date: '',
    serviceType: '', deliveryType: '', zipCode: '', eventCategory: '',
  })

  // Pre-select event category when triggered from Fleet gallery
  useEffect(() => {
    const handler = (e: Event): void => {
      const category = (e as CustomEvent<{ category: string }>).detail.category
      setForm((prev) => ({ ...prev, serviceType: 'Event Decor', eventCategory: category }))
    }
    window.addEventListener('preset-category', handler)
    return () => window.removeEventListener('preset-category', handler)
  }, [])

  const handleChange =
    (field: keyof BookingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const value = e.target.value
      if (field === 'serviceType') {
        setForm({ ...form, serviceType: value as ServiceType, deliveryType: '', zipCode: '', eventCategory: '' })
      } else if (field === 'deliveryType') {
        setForm({ ...form, deliveryType: value as DeliveryType, zipCode: '' })
      } else {
        setForm({ ...form, [field]: value })
      }
    }

  const handleDateTimeConfirm = (date: string, time: string): void => {
    setForm({ ...form, date, time })
    setShowPicker(false)
  }

  const openPicker = async (): Promise<void> => {
    const dates = await fetchReservedDates()
    setReservedDates(dates)
    setShowPicker(true)
  }

  const handleGetQuote = (): void => {
    const dateDisplay = form.date ? formatDateTimeDisplay(form.date, form.time) : 'Not selected'
    let serviceDetails = form.serviceType
    if (form.serviceType === 'Rental' && form.deliveryType) {
      serviceDetails += ` – ${form.deliveryType}`
      if (form.deliveryType === 'Drop-off' && form.zipCode) serviceDetails += ` (Zip: ${form.zipCode})`
    }
    if (form.serviceType === 'Event Decor' && form.eventCategory) serviceDetails += ` – ${form.eventCategory}`
    const message = [
      '🌸 *New Quote Request – Mes Decor*', '',
      `👤 *Name:* ${form.fullName || 'N/A'}`,
      `📞 *Phone:* ${form.phone || 'N/A'}`,
      `🎀 *Service:* ${serviceDetails || 'N/A'}`,
      `📅 *Date & Time:* ${dateDisplay}`,
    ].join('\n')
    window.open(`https://wa.me/19723755225?text=${encodeURIComponent(message)}`, '_blank')

    submitBooking({
      name:    form.fullName,
      phone:   form.phone,
      service: serviceDetails || form.serviceType,
      date:    form.date,
      time:    form.time,
    }).catch(() => {/* silent */})
  }

  // Shared input/select + label classes
  const inputCls = 'w-full bg-white/[0.06] border border-[rgba(160,134,80,0.30)] rounded-lg px-3 py-2 text-off-white text-[13px] outline-none transition-colors focus:border-[rgba(160,134,80,0.85)] appearance-none placeholder:text-white/30'
  const labelCls = 'block text-[11px] text-white/55 mb-[5px] font-medium'

  return (
    <>
      {/* Hidden on desktop (≥ 901px), shown as block on tablet/mobile (≤ 900px) */}
      <section className="hidden tab:block bg-cream px-6 mob:px-4 py-14 mob:py-10 text-center" id="quote-section">
        <h2 className="text-[28px] font-bold text-text-dark mb-6">Get a Quote</h2>

        {/* Form card — dark background, max-width centred */}
        <div className="max-w-[440px] mx-auto bg-dark rounded-card px-5 mob:px-[14px] py-6 mob:py-[18px] text-left border border-[rgba(160,134,80,0.28)]">

          {/* Social icons */}
          <div className="flex gap-[6px] mob:gap-[6px] justify-center mb-[14px] pb-[14px] border-b border-[rgba(160,134,80,0.25)]">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 mob:w-7 mob:h-7 rounded-full border border-white/[0.28] text-white/[0.82] flex items-center justify-center no-underline transition-colors hover:bg-[rgba(160,134,80,0.35)] hover:border-gold hover:text-off-white"
              >
                <Icon />
              </a>
            ))}
          </div>

          <h3 className="text-[13px] font-semibold leading-[1.45] mb-4 text-off-white">Fill in your information</h3>

          <div className="mb-[11px]">
            <label className={labelCls}>Full Name*</label>
            <input type="text" placeholder="Your Full Name" value={form.fullName} onChange={handleChange('fullName')} className={inputCls} />
          </div>

          <div className="mb-[11px]">
            <label className={labelCls}>Phone Number*</label>
            <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange('phone')} className={inputCls} />
          </div>

          <div className="mb-[11px]">
            <label className={labelCls}>Service Type*</label>
            <select value={form.serviceType} onChange={handleChange('serviceType')} className={inputCls}>
              <option value="">Select service type</option>
              <option value="Rental">Rental</option>
              <option value="Event Decor">Event Decor</option>
            </select>
          </div>

          {form.serviceType === 'Rental' && (
            <div className="mb-[11px]">
              <label className={labelCls}>Delivery Type*</label>
              <select value={form.deliveryType} onChange={handleChange('deliveryType')} className={inputCls}>
                <option value="">Select delivery type</option>
                <option value="Drop-off">Drop-off</option>
                <option value="Pick-up">Pick-up</option>
              </select>
            </div>
          )}

          {form.serviceType === 'Rental' && form.deliveryType === 'Drop-off' && (
            <div className="mb-[11px]">
              <label className={labelCls}>Zip Code*</label>
              <input type="text" placeholder="Enter zip code" maxLength={10} value={form.zipCode} onChange={handleChange('zipCode')} className={inputCls} />
            </div>
          )}

          {form.serviceType === 'Event Decor' && (
            <div className="mb-[11px]">
              <label className={labelCls}>Event Category*</label>
              <select value={form.eventCategory} onChange={handleChange('eventCategory')} className={inputCls}>
                <option value="">Select event category</option>
                {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="mb-[11px]">
            <label className={labelCls}>Event Date &amp; Time*</label>
            <button
              type="button"
              className={`dtp-trigger${form.date ? ' dtp-trigger--filled' : ''}`}
              onClick={() => void openPicker()}
            >
              {formatDateTimeDisplay(form.date, form.time)}
            </button>
          </div>

          <button
            className="w-full py-3 bg-gold hover:bg-gold-dark active:scale-[0.98] text-off-white border-none rounded-lg text-[14px] font-semibold cursor-pointer mt-[6px] transition-colors"
            onClick={handleGetQuote}
          >
            Get a Quote
          </button>
        </div>
      </section>

      {showPicker && (
        <DateTimePicker
          initialDate={form.date}
          initialTime={form.time}
          reservedDates={reservedDates}
          onConfirm={handleDateTimeConfirm}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
