import React from 'react'
import { useState } from 'react'
import { ArrowRight } from './icons'

// ── Types ──────────────────────────────────────────────────
interface Service {
  id: string
  label: string
  description: string
  image: string
}

// ── Data ───────────────────────────────────────────────────
const SERVICES: Service[] = [
  { id: 'weddings',  label: 'Weddings',         description: 'Full wedding decoration with floral arrangements, table settings, and venue styling tailored to your dream aesthetic.',          image: 'service-wedding'  },
  { id: 'birthdays', label: 'Birthday Parties',  description: 'Stunning birthday setups from intimate gatherings to grand celebrations, customized to your theme.',                             image: 'service-birthday' },
  { id: 'corporate', label: 'Corporate Events',  description: 'Professional and elegant decor for corporate galas, conferences, and company milestones.',                                      image: 'service-corporate'},
  { id: 'photo',     label: 'Photo Shoots',      description: 'Beautifully styled sets and backdrops for editorial, commercial, and personal photography sessions.',                           image: 'service-photo'    },
  { id: 'special',   label: 'Special Events',    description: 'Custom decor solutions for anniversaries, proposals, baby showers, and any occasion worth celebrating.',                       image: 'service-special'  },
]

// ── Component ──────────────────────────────────────────────
export default function Services(): React.ReactElement {
  const [activeId, setActiveId] = useState<string>('weddings')

  const active: Service = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0]

  return (
    <section className="services-section" id="services">
      <h2 className="services-title">Our Services</h2>
      <p className="services-subtitle">
        Tailored luxury services designed to elevate your<br />most memorable moments.
      </p>

      <div className="services-body">
        <div className="services-image">
          <img src={`https://picsum.photos/seed/${active.image}/700/500`} alt={active.label} />
        </div>

        <div className="services-list">
          <p className="services-description">{active.description}</p>
          {SERVICES.map((service) => (
            <button
              key={service.id}
              className={`service-item${activeId === service.id ? ' service-item--active' : ''}`}
              onClick={() => setActiveId(service.id)}
            >
              <span>{service.label}</span>
              <span className={`arrow-circle${activeId === service.id ? ' arrow-circle--gold' : ' arrow-circle--outline'}`}>
                <ArrowRight />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
