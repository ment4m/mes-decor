import React, { useState } from 'react'
import { ArrowRight } from './icons'

// ── Types ──────────────────────────────────────────────────
interface ExperienceItem {
  id: number
  seed: string
  name: string
}

// ── Data ───────────────────────────────────────────────────
const ITEMS: ExperienceItem[] = [
  { id:  1, seed: 'rent1',  name: 'Gold Chiavari Chairs'      },
  { id:  2, seed: 'rent2',  name: 'Floral Backdrop Stand'     },
  { id:  3, seed: 'rent3',  name: 'Luxury Arch Frame'         },
  { id:  4, seed: 'rent4',  name: 'Round Banquet Tables'      },
  { id:  5, seed: 'rent5',  name: 'Champagne Wall'            },
  { id:  6, seed: 'rent6',  name: 'LED Marquee Letters'       },
  { id:  7, seed: 'rent7',  name: 'Balloon Garland Kit'       },
  { id:  8, seed: 'rent8',  name: 'Sweetheart Table Set'      },
  { id:  9, seed: 'rent9',  name: 'Candle Pillar Collection'  },
  { id: 10, seed: 'rent10', name: 'Photo Booth Frame'         },
  { id: 11, seed: 'rent11', name: 'Drape Canopy Set'          },
  { id: 12, seed: 'rent12', name: 'Lounge Furniture Set'      },
]

const PAGE_SIZE = 4

// ── Component ──────────────────────────────────────────────
export default function Experience(): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const visibleItems = ITEMS.slice(0, visibleCount)
  const hasMore      = visibleCount < ITEMS.length

  return (
    <section className="experience-section">
      <h2 className="experience-title">Rentals</h2>
      <p className="experience-subtitle">
        Browse our curated collection of premium rental pieces<br />
        everything you need to bring your vision to life.
      </p>

      <div className="experience-grid">
        {visibleItems.map((item) => (
          <div key={item.id} className="experience-card">
            <img src={`https://picsum.photos/seed/${item.seed}/700/500`} alt={item.name} />
            <div className="experience-card-overlay">
              <div className="experience-card-info">
                <span className="experience-card-name">{item.name}</span>
              </div>
              <button
                className="experience-book-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Get a Quote
                <span className="arrow-circle arrow-circle--gold"><ArrowRight /></span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="experience-more">
        {hasMore ? (
          <button
            className="arrow-pill-btn arrow-pill-btn--outline-light"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            More Rentals
            <span className="arrow-circle arrow-circle--light"><ArrowRight /></span>
          </button>
        ) : (
          <button
            className="arrow-pill-btn arrow-pill-btn--outline-light"
            onClick={() => setVisibleCount(PAGE_SIZE)}
          >
            Show Less
            <span className="arrow-circle arrow-circle--light"><ArrowRight /></span>
          </button>
        )}
      </div>
    </section>
  )
}
