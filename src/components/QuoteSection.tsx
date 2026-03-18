import React, { useState } from 'react'
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

  return (
    <>
      <section className="quote-section" id="quote-section">
        <h2 className="quote-section-title">Get a Quote</h2>

        <div className="booking-form booking-form--standalone">
          <div className="form-socials">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="form-social-icon">
                <Icon />
              </a>
            ))}
          </div>

          <h3>Fill in your information</h3>

          <div className="form-group">
            <label>Full Name*</label>
            <input type="text" placeholder="Your Full Name" value={form.fullName} onChange={handleChange('fullName')} />
          </div>

          <div className="form-group">
            <label>Phone Number*</label>
            <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange('phone')} />
          </div>

          <div className="form-group">
            <label>Service Type*</label>
            <select value={form.serviceType} onChange={handleChange('serviceType')}>
              <option value="">Select service type</option>
              <option value="Rental">Rental</option>
              <option value="Event Decor">Event Decor</option>
            </select>
          </div>

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
              <input type="text" placeholder="Enter zip code" maxLength={10} value={form.zipCode} onChange={handleChange('zipCode')} />
            </div>
          )}

          {form.serviceType === 'Event Decor' && (
            <div className="form-group">
              <label>Event Category*</label>
              <select value={form.eventCategory} onChange={handleChange('eventCategory')}>
                <option value="">Select event category</option>
                {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Event Date &amp; Time*</label>
            <button
              type="button"
              className={`dtp-trigger${form.date ? ' dtp-trigger--filled' : ''}`}
              onClick={() => void openPicker()}
            >
              {formatDateTimeDisplay(form.date, form.time)}
            </button>
          </div>

          <button className="btn-book" onClick={handleGetQuote}>Get a Quote</button>
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
