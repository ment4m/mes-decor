import React, { useState, useEffect } from 'react'
import { WhatsApp, Instagram } from './icons'
import DateTimePicker from './DateTimePicker'
import { submitBooking, fetchReservedDates } from '../lib/airtable'

// ── Types ──────────────────────────────────────────────────
interface SocialLink {
  Icon: () => React.ReactElement
  label: string
  href: string
}

type ServiceType    = '' | 'Rental' | 'Event Decor'
type DeliveryType   = '' | 'Drop-off' | 'Pick-up'

interface BookingForm {
  fullName:     string
  phone:        string
  time:         string   // HH:MM 24h
  date:         string   // YYYY-MM-DD
  serviceType:  ServiceType
  deliveryType: DeliveryType
  zipCode:      string
  eventCategory: string
}

// ── Data ───────────────────────────────────────────────────
const HERO_IMAGES: string[] = [
  '/hero/hero1.jpg',
  '/hero/hero2.jpg',
  '/hero/hero3.jpg',
  '/hero/hero4.jpg',
  '/hero/hero5.jpg',
  '/hero/hero6.jpg',
]

const SOCIAL_LINKS: SocialLink[] = [
  { Icon: WhatsApp,  label: 'WhatsApp',  href: 'https://wa.me/19723755225'           },
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/decorbymessi'  },
]

export const EVENT_CATEGORIES: string[] = [
  'Birthday', 'Baby Shower', 'Christening', 'Graduation', 'Others',
]

// ── Helpers ────────────────────────────────────────────────
const formatDateTimeDisplay = (date: string, time: string): string => {
  if (!date) return 'Select date & time'
  const d       = new Date(date + 'T12:00:00')
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const [h, m]  = time.split(':').map(Number)
  const ampm    = h < 12 ? 'AM' : 'PM'
  const h12     = h % 12 || 12
  return `${dateStr}  ·  ${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// ── Component ──────────────────────────────────────────────
export default function Hero(): React.ReactElement {
  const [currentSlide,   setCurrentSlide]   = useState<number>(0)
  const [showPicker,     setShowPicker]     = useState<boolean>(false)
  const [reservedDates,  setReservedDates]  = useState<string[]>([])
  const [errors,         setErrors]         = useState<Partial<Record<keyof BookingForm, string>>>({})
  const [form, setForm] = useState<BookingForm>({
    fullName: '', phone: '',
    time: '09:00', date: '',
    serviceType: '', deliveryType: '', zipCode: '', eventCategory: '',
  })

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
      // Reset dependent fields when service type changes
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

  const validate = (): boolean => {
    const e: Partial<Record<keyof BookingForm, string>> = {}
    if (!form.fullName.trim())  e.fullName     = 'Full name is required'
    if (!form.phone.trim())     e.phone        = 'Phone number is required'
    if (!form.serviceType)      e.serviceType  = 'Please select a service type'
    if (form.serviceType === 'Rental' && !form.deliveryType)
                                e.deliveryType = 'Please select a delivery type'
    if (form.serviceType === 'Rental' && form.deliveryType === 'Drop-off' && !form.zipCode.trim())
                                e.zipCode      = 'Zip code is required for drop-off'
    if (form.serviceType === 'Event Decor' && !form.eventCategory)
                                e.eventCategory = 'Please select an event category'
    if (!form.date)             e.date         = 'Please select a date & time'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGetQuote = (): void => {
    if (!validate()) return
    const dateDisplay = form.date
      ? formatDateTimeDisplay(form.date, form.time)
      : 'Not selected'

    let serviceDetails = form.serviceType
    if (form.serviceType === 'Rental' && form.deliveryType) {
      serviceDetails += ` – ${form.deliveryType}`
      if (form.deliveryType === 'Drop-off' && form.zipCode) {
        serviceDetails += ` (Zip: ${form.zipCode})`
      }
    }
    if (form.serviceType === 'Event Decor' && form.eventCategory) {
      serviceDetails += ` – ${form.eventCategory}`
    }

    const message = [
      '🌸 *New Quote Request – Mes Decor*',
      '',
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
    }).catch(() => {/* silent – WhatsApp message already sent */})
  }

  // Shared input/select classes
  const inputCls = 'w-full bg-white/[0.06] border border-[rgba(160,134,80,0.30)] rounded-lg px-3 py-2 text-off-white text-[13px] outline-none transition-colors focus:border-[rgba(160,134,80,0.85)] appearance-none placeholder:text-white/30'
  const labelCls = 'block text-[11px] text-white/55 mb-[5px] font-medium'

  return (
    <>
      {/* hero — relative, full-viewport, flex row with space-between */}
      <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-between tab:flex-col tab:items-center tab:justify-center px-[52px] tab:px-6 mob:px-4 py-[80px] tab:pt-[100px] tab:pb-[80px] mob:py-[80px] mob:pb-[70px] gap-6 tab:gap-8 mob:gap-6">

        {/* ── Background Slideshow ── */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((src, i) => (
            <div key={src} className={`hero-slide${i === currentSlide ? ' active' : ''}`}>
              <img src={src} alt="" className="w-full h-full object-cover block" />
            </div>
          ))}
          {/* Gradient overlay — left side dark, right side transparent */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30,21,8,0.82) 0%, rgba(30,21,8,0.50) 55%, rgba(30,21,8,0.12) 100%)' }} />
        </div>

        {/* ── Left: Headline ── */}
        <div className="flex-1 text-off-white max-w-[460px] tab:max-w-full tab:text-center relative z-[2] -mt-10 tab:mt-0">
          <h1 className="text-[42px] tab:text-[32px] mob:text-[26px] font-bold leading-[1.18] mob:leading-[1.25] mb-[18px] tracking-[-0.5px]">
            Elegance in Every<br />Detail for Your<br />Special Day
          </h1>
          <p className="text-[13px] mob:text-[12px] italic text-white/[0.78] leading-[1.8] mb-7">
            Transform your event with our curated collection of premium<br />
            decorations, each crafted to bring sophistication and style<br />
            to your most cherished moments.
          </p>
        </div>

        {/* ── Right: Booking Form ── hidden on tablet/mobile (tab breakpoint) ── */}
        <div
          className="relative z-[2] w-[292px] tab:hidden flex-shrink-0 bg-[rgba(30,21,8,0.86)] backdrop-blur-[14px] rounded-card p-[22px_20px_20px] text-off-white border border-[rgba(160,134,80,0.28)]"
          id="booking-form"
        >
          {/* Social icons at top */}
          <div className="flex gap-2 justify-center mb-[14px] pb-[14px] border-b border-[rgba(160,134,80,0.25)]">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-white/[0.28] text-white/[0.82] flex items-center justify-center no-underline transition-colors hover:bg-[rgba(160,134,80,0.35)] hover:border-gold hover:text-off-white"
              >
                <Icon />
              </a>
            ))}
          </div>

          <h3 className="text-[14px] font-semibold leading-[1.45] mb-4">Fill in the box provide your information</h3>

          <div className="mb-[11px]">
            <label className={labelCls}>Full Name*</label>
            <input type="text" placeholder="Your Full Name" value={form.fullName} onChange={handleChange('fullName')} className={inputCls} />
            {errors.fullName && <span className="text-xs text-red-400 mt-1 block">{errors.fullName}</span>}
          </div>

          <div className="mb-[11px]">
            <label className={labelCls}>Phone Number*</label>
            <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange('phone')} className={inputCls} />
            {errors.phone && <span className="text-xs text-red-400 mt-1 block">{errors.phone}</span>}
          </div>

          {/* ── Service Type ── */}
          <div className="mb-[11px]">
            <label className={labelCls}>Service Type*</label>
            <select value={form.serviceType} onChange={handleChange('serviceType')} className={inputCls}>
              <option value="">Select service type</option>
              <option value="Rental">Rental</option>
              <option value="Event Decor">Event Decor</option>
            </select>
            {errors.serviceType && <span className="text-xs text-red-400 mt-1 block">{errors.serviceType}</span>}
          </div>

          {/* ── Rental sub-fields ── */}
          {form.serviceType === 'Rental' && (
            <div className="mb-[11px]">
              <label className={labelCls}>Delivery Type*</label>
              <select value={form.deliveryType} onChange={handleChange('deliveryType')} className={inputCls}>
                <option value="">Select delivery type</option>
                <option value="Drop-off">Drop-off</option>
                <option value="Pick-up">Pick-up</option>
              </select>
              {errors.deliveryType && <span className="text-xs text-red-400 mt-1 block">{errors.deliveryType}</span>}
            </div>
          )}

          {form.serviceType === 'Rental' && form.deliveryType === 'Drop-off' && (
            <div className="mb-[11px]">
              <label className={labelCls}>Zip Code*</label>
              <input
                type="text"
                placeholder="Enter zip code"
                maxLength={10}
                value={form.zipCode}
                onChange={handleChange('zipCode')}
                className={inputCls}
              />
              {errors.zipCode && <span className="text-xs text-red-400 mt-1 block">{errors.zipCode}</span>}
            </div>
          )}

          {/* ── Event Decor sub-fields ── */}
          {form.serviceType === 'Event Decor' && (
            <div className="mb-[11px]">
              <label className={labelCls}>Event Category*</label>
              <select value={form.eventCategory} onChange={handleChange('eventCategory')} className={inputCls}>
                <option value="">Select event category</option>
                {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.eventCategory && <span className="text-xs text-red-400 mt-1 block">{errors.eventCategory}</span>}
            </div>
          )}

          {/* ── Date & Time ── */}
          <div className="mb-[11px]">
            <label className={labelCls}>Event Date &amp; Time*</label>
            <button
              type="button"
              className={`dtp-trigger${form.date ? ' dtp-trigger--filled' : ''}`}
              onClick={() => void openPicker()}
            >
              {formatDateTimeDisplay(form.date, form.time)}
            </button>
            {errors.date && <span className="text-xs text-red-400 mt-1 block">{errors.date}</span>}
          </div>

          <button
            className="w-full py-3 bg-gold hover:bg-gold-dark active:scale-[0.98] text-off-white border-none rounded-lg text-[14px] font-semibold cursor-pointer mt-[6px] transition-colors"
            onClick={handleGetQuote}
          >
            Get a Quote
          </button>
        </div>

        {/* ── Slide Dot Indicators ── */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-[3]">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full border-[1.5px] p-0 cursor-pointer transition-colors ${
                i === currentSlide
                  ? 'bg-gold border-gold'
                  : 'bg-transparent border-white/55'
              }`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

      </section>

      {/* ── Custom Date & Time Picker ── rendered outside hero to avoid overflow clip ── */}
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
