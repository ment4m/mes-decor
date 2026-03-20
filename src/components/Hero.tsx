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

  return (
    <>
      <section className="hero">

        {/* ── Background Slideshow ── */}
        <div className="hero-slides">
          {HERO_IMAGES.map((src, i) => (
            <div key={src} className={`hero-slide${i === currentSlide ? ' active' : ''}`}>
              <img src={src} alt="" />
            </div>
          ))}
          <div className="hero-overlay" />
        </div>

        {/* ── Left: Headline ── */}
        <div className="hero-content">
          <h1 className="hero-title">
            Elegance in Every<br />Detail for Your<br />Special Day
          </h1>
          <p className="hero-subtitle">
            Transform your event with our curated collection of premium<br />
            decorations, each crafted to bring sophistication and style<br />
            to your most cherished moments.
          </p>
        </div>

        {/* ── Right: Booking Form ── */}
        <div className="booking-form" id="booking-form">

          {/* Social icons at top */}
          <div className="form-socials">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="form-social-icon">
                <Icon />
              </a>
            ))}
          </div>

          <h3>Fill in the box provide your information</h3>

          <div className="form-group">
            <label>Full Name*</label>
            <input type="text" placeholder="Your Full Name" value={form.fullName} onChange={handleChange('fullName')} />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number*</label>
            <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange('phone')} />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* ── Service Type ── */}
          <div className="form-group">
            <label>Service Type*</label>
            <select value={form.serviceType} onChange={handleChange('serviceType')}>
              <option value="">Select service type</option>
              <option value="Rental">Rental</option>
              <option value="Event Decor">Event Decor</option>
            </select>
            {errors.serviceType && <span className="form-error">{errors.serviceType}</span>}
          </div>

          {/* ── Rental sub-fields ── */}
          {form.serviceType === 'Rental' && (
            <div className="form-group">
              <label>Delivery Type*</label>
              <select value={form.deliveryType} onChange={handleChange('deliveryType')}>
                <option value="">Select delivery type</option>
                <option value="Drop-off">Drop-off</option>
                <option value="Pick-up">Pick-up</option>
              </select>
              {errors.deliveryType && <span className="form-error">{errors.deliveryType}</span>}
            </div>
          )}

          {form.serviceType === 'Rental' && form.deliveryType === 'Drop-off' && (
            <div className="form-group">
              <label>Zip Code*</label>
              <input
                type="text"
                placeholder="Enter zip code"
                maxLength={10}
                value={form.zipCode}
                onChange={handleChange('zipCode')}
              />
              {errors.zipCode && <span className="form-error">{errors.zipCode}</span>}
            </div>
          )}

          {/* ── Event Decor sub-fields ── */}
          {form.serviceType === 'Event Decor' && (
            <div className="form-group">
              <label>Event Category*</label>
              <select value={form.eventCategory} onChange={handleChange('eventCategory')}>
                <option value="">Select event category</option>
                {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.eventCategory && <span className="form-error">{errors.eventCategory}</span>}
            </div>
          )}

          {/* ── Date & Time ── */}
          <div className="form-group">
            <label>Event Date &amp; Time*</label>
            <button
              type="button"
              className={`dtp-trigger${form.date ? ' dtp-trigger--filled' : ''}`}
              onClick={() => void openPicker()}
            >
              {formatDateTimeDisplay(form.date, form.time)}
            </button>
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <button className="btn-book" onClick={handleGetQuote}>Get a Quote</button>
        </div>

        {/* ── Slide Dot Indicators ── */}
        <div className="hero-dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === currentSlide ? ' active' : ''}`}
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
