import React, { useState, useEffect } from 'react'
import { WhatsApp, Instagram, YouTube, Facebook, Pinterest } from './icons'
import DateTimePicker from './DateTimePicker'

// ── Types ──────────────────────────────────────────────────
interface SocialLink {
  Icon: () => React.ReactElement
  label: string
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
  'https://picsum.photos/seed/decor-hero1/1600/900',
  'https://picsum.photos/seed/decor-hero2/1600/900',
  'https://picsum.photos/seed/decor-hero3/1600/900',
  'https://picsum.photos/seed/decor-hero4/1600/900',
  'https://picsum.photos/seed/decor-hero5/1600/900',
]

const SOCIAL_LINKS: SocialLink[] = [
  { Icon: WhatsApp,  label: 'WhatsApp'  },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: YouTube,   label: 'YouTube'   },
  { Icon: Facebook,  label: 'Facebook'  },
  { Icon: Pinterest, label: 'Pinterest' },
]

export const EVENT_CATEGORIES: string[] = [
  'Wedding', 'Baby Shower', 'Birthday', 'Graduation', 'Christening', 'Others',
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
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [showPicker,   setShowPicker]   = useState<boolean>(false)
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

  const handleGetQuote = (): void => {
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

    const url = `https://wa.me/19723755225?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
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
            {SOCIAL_LINKS.map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="form-social-icon">
                <Icon />
              </a>
            ))}
          </div>

          <h3>Fill in the box provide your information</h3>

          <div className="form-group">
            <label>Full Name*</label>
            <input type="text" placeholder="Your Full Name" value={form.fullName} onChange={handleChange('fullName')} />
          </div>

          <div className="form-group">
            <label>Phone Number*</label>
            <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange('phone')} />
          </div>

          {/* ── Service Type ── */}
          <div className="form-group">
            <label>Service Type*</label>
            <select value={form.serviceType} onChange={handleChange('serviceType')}>
              <option value="">Select service type</option>
              <option value="Rental">Rental</option>
              <option value="Event Decor">Event Decor</option>
            </select>
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
            </div>
          )}

          {/* ── Date & Time ── */}
          <div className="form-group">
            <label>Event Date &amp; Time*</label>
            <button
              type="button"
              className={`dtp-trigger${form.date ? ' dtp-trigger--filled' : ''}`}
              onClick={() => setShowPicker(true)}
            >
              {formatDateTimeDisplay(form.date, form.time)}
            </button>
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
          onConfirm={handleDateTimeConfirm}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
