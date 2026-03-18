import React, { useState, useEffect, useCallback } from 'react'
import { ArrowRight } from './icons'

// ── Types ──────────────────────────────────────────────────
interface ExperienceItem {
  id:     number
  name:   string
  images: string[]
}

// ── Data ───────────────────────────────────────────────────
const ITEMS: ExperienceItem[] = [
  { id: 1, name: 'Serpentine Table',    images: ['/rental/rental1.jpg'] },
  { id: 2, name: 'Chiavari Chairs',     images: ['/rental/rental2.jpg'] },
  { id: 3, name: 'Grad Marquee Letters',images: ['/rental/rental3.jpg'] },
]

const PAGE_SIZE = 4

// ── Lightbox ───────────────────────────────────────────────
function Lightbox({ item, onClose }: { item: ExperienceItem; onClose: () => void }): React.ReactElement {
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
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <div className="lightbox-img-wrap">
          <img src={item.images[slide]} alt={item.name} className="lightbox-img" />
        </div>
        {item.images.length > 1 && (
          <>
            <button className="lightbox-arrow lightbox-arrow--left"  onClick={prev}>‹</button>
            <button className="lightbox-arrow lightbox-arrow--right" onClick={next}>›</button>
          </>
        )}
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

// ── Component ──────────────────────────────────────────────
export default function Experience(): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [lightboxItem, setLightboxItem] = useState<ExperienceItem | null>(null)

  const visibleItems = ITEMS.slice(0, visibleCount)
  const hasMore      = visibleCount < ITEMS.length

  return (
    <>
      <section className="experience-section">
        <h2 className="experience-title">Rentals</h2>
        <p className="experience-subtitle">
          Browse our curated collection of premium rental pieces<br />
          everything you need to bring your vision to life.
        </p>

        <div className="experience-grid">
          {visibleItems.map((item) => (
            <div key={item.id} className="experience-card" style={{ cursor: 'pointer' }} onClick={() => setLightboxItem(item)}>
              <img src={item.images[0]} alt={item.name} />
              <div className="experience-card-overlay">
                <div className="experience-card-info">
                  <span className="experience-card-name">{item.name}</span>
                </div>
                <button
                  className="experience-book-btn"
                  onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
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
            <button className="arrow-pill-btn arrow-pill-btn--outline-light" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
              More Rentals
              <span className="arrow-circle arrow-circle--light"><ArrowRight /></span>
            </button>
          ) : (
            <button className="arrow-pill-btn arrow-pill-btn--outline-light" onClick={() => setVisibleCount(PAGE_SIZE)}>
              Show Less
              <span className="arrow-circle arrow-circle--light"><ArrowRight /></span>
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
