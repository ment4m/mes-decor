import React from 'react'
import { Crown, Medal, Star, Shield } from './icons'

// ── Types ──────────────────────────────────────────────────
interface Reason {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  featured: boolean
}

// ── Data ───────────────────────────────────────────────────
const REASONS: Reason[] = [
  {
    id: 'premium',
    icon: <Crown />,
    title: 'Premium Wedding Only Service',
    description: 'Exclusively dedicated to weddings, ensuring every detail reflects elegance and romance.',
    featured: true,
  },
  {
    id: 'luxury',
    icon: <Medal />,
    title: 'Luxury Floral Designs',
    description: 'A curated collection of high-end floral and decor pieces, each styled by professional decorators.',
    featured: false,
  },
  {
    id: 'tailored',
    icon: <Star />,
    title: 'Tailored Experience',
    description: 'Every setup is customized to match your event theme, style, and personal preferences.',
    featured: false,
  },
  {
    id: 'trusted',
    icon: <Shield />,
    title: 'Trusted by Couples & Planners',
    description: 'Highly rated by wedding planners and hundreds of happy couples who chose us for their big day.',
    featured: false,
  },
]

// ── Component ──────────────────────────────────────────────
export default function WhyUs(): React.ReactElement {
  return (
    <section className="whyus-section" id="why-us">
      <div className="whyus-left">
        <h2 className="whyus-title">Why Us?</h2>
        <p className="whyus-description">
          The reasons discerning couples choose us for an unforgettable wedding journey.
        </p>
      </div>

      <div className="whyus-cards">
        {REASONS.map((reason) => (
          <div
            key={reason.id}
            className={`whyus-card${reason.featured ? ' whyus-card--featured' : ''}`}
          >
            <div className="whyus-card-icon">{reason.icon}</div>
            <h4 className="whyus-card-title">{reason.title}</h4>
            <p className="whyus-card-desc">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
