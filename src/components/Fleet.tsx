import React, { useState } from 'react'
import { ArrowRight } from './icons'
import { EVENT_CATEGORIES } from './Hero'

// ── Types ──────────────────────────────────────────────────
interface FleetItem {
  id: number
  seed: string
  category: string
  name: string
}

// ── Data ───────────────────────────────────────────────────
const FILTERS: string[] = ['All', ...EVENT_CATEGORIES]

const FLEET_ITEMS: FleetItem[] = [
  // Wedding
  { id:  1, seed: 'wedding1',    category: 'Wedding',     name: 'Royal Ballroom Setup'         },
  { id:  2, seed: 'wedding2',    category: 'Wedding',     name: 'Garden Arch Ceremony'          },
  { id:  3, seed: 'wedding3',    category: 'Wedding',     name: 'Luxury Floral Aisle'           },
  { id:  4, seed: 'wedding4',    category: 'Wedding',     name: 'Candlelit Reception'           },
  // Baby Shower
  { id:  5, seed: 'babyshower1', category: 'Baby Shower', name: 'Sweet Baby Shower Garden'     },
  { id:  6, seed: 'babyshower2', category: 'Baby Shower', name: 'Pastel Balloon Wonderland'    },
  { id:  7, seed: 'babyshower3', category: 'Baby Shower', name: 'Floral Cloud Setup'           },
  { id:  8, seed: 'babyshower4', category: 'Baby Shower', name: 'Dreamy Star Canopy'           },
  // Birthday
  { id:  9, seed: 'birthday1',   category: 'Birthday',    name: 'Grand Birthday Gala'          },
  { id: 10, seed: 'birthday2',   category: 'Birthday',    name: 'Glam Balloon Arch'            },
  { id: 11, seed: 'birthday3',   category: 'Birthday',    name: 'Elegant Gold Table Setup'     },
  { id: 12, seed: 'birthday4',   category: 'Birthday',    name: 'Garden Birthday Party'        },
  // Graduation
  { id: 13, seed: 'grad1',       category: 'Graduation',  name: 'Graduation Celebration'       },
  { id: 14, seed: 'grad2',       category: 'Graduation',  name: 'Academic Achievement Setup'   },
  { id: 15, seed: 'grad3',       category: 'Graduation',  name: 'Confetti & Gold Decor'        },
  { id: 16, seed: 'grad4',       category: 'Graduation',  name: 'Milestone Balloon Wall'       },
  // Christening
  { id: 17, seed: 'christening1',category: 'Christening', name: 'Elegant Christening Setup'   },
  { id: 18, seed: 'christening2',category: 'Christening', name: 'White & Gold Blessing Arch'  },
  { id: 19, seed: 'christening3',category: 'Christening', name: 'Floral Font Arrangement'     },
  { id: 20, seed: 'christening4',category: 'Christening', name: 'Soft Bloom Table Decor'      },
  // Others
  { id: 21, seed: 'others1',     category: 'Others',      name: 'Custom Event Arrangement'     },
  { id: 22, seed: 'others2',     category: 'Others',      name: 'Romantic Dinner Setup'        },
  { id: 23, seed: 'others3',     category: 'Others',      name: 'Corporate Gala Night'         },
  { id: 24, seed: 'others4',     category: 'Others',      name: 'Luxury Lounge Decor'          },
]

const PAGE_SIZE = 6

// ── Component ──────────────────────────────────────────────
export default function Fleet(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)

  const filtered: FleetItem[] = activeFilter === 'All'
    ? FLEET_ITEMS
    : FLEET_ITEMS.filter((item) => item.category === activeFilter)

  const visibleItems  = filtered.slice(0, visibleCount)
  const hasMore       = visibleCount < filtered.length

  const handleFilter = (f: string): void => {
    setActiveFilter(f)
    setVisibleCount(PAGE_SIZE)   // reset to first page on filter change
  }

  return (
    <section className="fleet-section" id="gallery">
      <h2 className="fleet-title">Discover Our Prestigious Decorations</h2>
      <p className="fleet-subtitle">
        Explore our handpicked collection of luxury event decorations —<br />
        each designed to make your event truly unforgettable.
      </p>

      <div className="fleet-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn${activeFilter === f ? ' active' : ''}`}
            onClick={() => handleFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="fleet-grid">
        {visibleItems.map((item) => (
          <div key={item.id} className="fleet-card">
            <div className="fleet-card-img">
              <img src={`https://picsum.photos/seed/${item.seed}/600/400`} alt={item.name} />
            </div>
            <div className="fleet-card-body">
              <span className="fleet-card-tag">{item.category}</span>
              <h4>{item.name}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="fleet-more">
        {hasMore ? (
          <button className="arrow-pill-btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Show More Decorations
            <span className="arrow-circle"><ArrowRight /></span>
          </button>
        ) : (
          <button className="arrow-pill-btn" onClick={() => setVisibleCount(PAGE_SIZE)}>
            Show Less
            <span className="arrow-circle"><ArrowRight /></span>
          </button>
        )}
      </div>
    </section>
  )
}
