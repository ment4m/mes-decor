import React, { useState, useEffect, useCallback } from 'react'
import { ArrowRight } from './icons'
import { EVENT_CATEGORIES } from './Hero'

// ── Types ──────────────────────────────────────────────────
interface FleetItem {
  id:       number
  category: string
  name:     string
  images:   string[]   // one image = static, multiple = auto-slideshow
}

// ── Data ───────────────────────────────────────────────────
// Replace placeholder URLs below with your real image paths e.g. '/wedding/royal-ballroom-1.jpg'
const FLEET_ITEMS: FleetItem[] = [
  // Birthday
  { id:  1, category: 'Birthday',    name: 'Birthday Event 1',           images: ['/birthday/birthday-event1-1.jpg', '/birthday/birthday-event1-2.jpg'] },
  { id:  2, category: 'Birthday',    name: 'Birthday Event 2',           images: ['/birthday/birthday-event2-1.jpg', '/birthday/birthday-event2-2.jpg'] },
  { id:  3, category: 'Birthday',    name: 'Birthday Event 3',           images: ['/birthday/birthday-event3-1.jpg', '/birthday/birthday-event3-2.jpg', '/birthday/birthday-event3-3.jpg'] },
  { id:  4, category: 'Birthday',    name: 'Birthday Event 4',           images: ['/birthday/birthday-event4-1.jpg', '/birthday/birthday-event4-2.jpg'] },
  { id:  5, category: 'Birthday',    name: 'Birthday Event 5',           images: ['/birthday/birthday-event5-1.jpg'] },
  { id:  6, category: 'Birthday',    name: 'Birthday Event 6',           images: ['/birthday/birthday-event6-1.jpg'] },
  // Baby Shower
  { id:  7, category: 'Baby Shower', name: 'Baby Shower Setup',          images: ['/baby-shower/babyShower-event1-1.jpg'] },
  // Christening
  { id:  8, category: 'Christening', name: 'Christening Event 1',        images: ['/christening/christening-event1-1.jpg', '/christening/christening-event1-2.jpg'] },
  // Graduation
  { id:  9, category: 'Graduation',  name: 'Graduation Event 1',         images: ['/graduation/graduation-event1-1.jpg', '/graduation/graduation-event1-2.jpg'] },
  { id: 10, category: 'Graduation',  name: 'Graduation Event 2',         images: ['/graduation/graduation-event2-1.jpg'] },
  { id: 11, category: 'Graduation',  name: 'Graduation Event 3',         images: ['/graduation/graduation-event3-1.jpg', '/graduation/graduation-event3-2.jpg', '/graduation/graduation-event3-3.jpg'] },
  // Wedding
  { id: 12, category: 'Wedding',     name: 'Wedding Event 1',            images: ['/wedding/wedding-event1-1.jpg'] },
  // Others
  { id: 13, category: 'Others',      name: 'Special Event 1',            images: ['/others/others-event1-1.jpg', '/others/others-event1-2.jpg'] },
  { id: 14, category: 'Others',      name: 'Special Event 2',            images: ['/others/others-event2-1.jpg'] },
]

const FILTERS: string[] = ['All', ...EVENT_CATEGORIES]
const PAGE_SIZE = 6

// ── Lightbox Modal ──────────────────────────────────────────
function Lightbox({ item, onClose }: { item: FleetItem; onClose: () => void }): React.ReactElement {
  const [slide, setSlide] = useState<number>(0)

  const prev = useCallback(() => setSlide((s) => (s - 1 + item.images.length) % item.images.length), [item.images.length])
  const next = useCallback(() => setSlide((s) => (s + 1) % item.images.length), [item.images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="lightbox-close" onClick={onClose}>✕</button>

        {/* Image */}
        <div className="lightbox-img-wrap">
          <img src={item.images[slide]} alt={item.name} className="lightbox-img" />
        </div>

        {/* Arrows */}
        {item.images.length > 1 && (
          <>
            <button className="lightbox-arrow lightbox-arrow--left"  onClick={prev}>‹</button>
            <button className="lightbox-arrow lightbox-arrow--right" onClick={next}>›</button>
          </>
        )}

        {/* Info + dots */}
        <div className="lightbox-footer">
          <span className="lightbox-name">{item.name}</span>
          {item.images.length > 1 && (
            <div className="lightbox-dots">
              {item.images.map((_, i) => (
                <button key={i} className={`lightbox-dot${i === slide ? ' active' : ''}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          )}
          <span className="lightbox-count">{slide + 1} / {item.images.length}</span>
        </div>
      </div>
    </div>
  )
}

// ── Card with optional auto-slideshow ──────────────────────
function FleetCard({ item, onOpen }: { item: FleetItem; onOpen: () => void }): React.ReactElement {
  const [slide, setSlide] = useState<number>(0)
  const hasMultiple = item.images.length > 1

  useEffect(() => {
    if (!hasMultiple) return
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % item.images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [hasMultiple, item.images.length])

  return (
    <div className="fleet-card" onClick={onOpen} style={{ cursor: 'pointer' }}>
      <div className="fleet-card-img">
        {item.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={item.name}
            className={`fleet-card-slide${i === slide ? ' fleet-card-slide--active' : ''}`}
          />
        ))}
        {hasMultiple && (
          <div className="fleet-card-dots">
            {item.images.map((_, i) => (
              <span key={i} className={`fleet-card-dot${i === slide ? ' active' : ''}`} />
            ))}
          </div>
        )}
      </div>
      <div className="fleet-card-body">
        <span className="fleet-card-tag">{item.category}</span>
        <h4>{item.name}</h4>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────
export default function Fleet(): React.ReactElement {
  const [activeFilter, setActiveFilter]   = useState<string>('All')
  const [visibleCount, setVisibleCount]   = useState<number>(PAGE_SIZE)
  const [lightboxItem, setLightboxItem]   = useState<FleetItem | null>(null)

  const filtered = activeFilter === 'All'
    ? FLEET_ITEMS
    : FLEET_ITEMS.filter((item) => item.category === activeFilter)

  const visibleItems = filtered.slice(0, visibleCount)
  const hasMore      = visibleCount < filtered.length

  const handleFilter = (f: string): void => {
    setActiveFilter(f)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <>
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
          <FleetCard key={item.id} item={item} onOpen={() => setLightboxItem(item)} />
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

    {lightboxItem && (
      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    )}
    </>
  )
}
