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
  { id:  1, seed: 'exp1',  name: 'Royal Floral Arch'         },
  { id:  2, seed: 'exp2',  name: 'Luxury Tablescape'         },
  { id:  3, seed: 'exp3',  name: 'Garden Romance Setup'      },
  { id:  4, seed: 'exp4',  name: 'Grand Entrance Display'    },
  { id:  5, seed: 'exp5',  name: 'Candlelit Ceremony Aisle'  },
  { id:  6, seed: 'exp6',  name: 'Floral Ceiling Installation'},
  { id:  7, seed: 'exp7',  name: 'Balloon Arch Backdrop'     },
  { id:  8, seed: 'exp8',  name: 'Boho Chic Picnic Setup'    },
  { id:  9, seed: 'exp9',  name: 'Gold & White Reception'    },
  { id: 10, seed: 'exp10', name: 'Rustic Wooden Arbor'       },
  { id: 11, seed: 'exp11', name: 'Dreamy Drape Canopy'       },
  { id: 12, seed: 'exp12', name: 'Luxury Lounge Corner'      },
]

const PAGE_SIZE = 4

// ── Component ──────────────────────────────────────────────
export default function Experience(): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const visibleItems = ITEMS.slice(0, visibleCount)
  const hasMore      = visibleCount < ITEMS.length

  return (
    <section className="experience-section">
      <h2 className="experience-title">Experience the Elegance</h2>
      <p className="experience-subtitle">
        Discover the unmatched beauty and prestige of our decorations —<br />
        crafted to make your special day truly extraordinary.
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
            More Decorations
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
