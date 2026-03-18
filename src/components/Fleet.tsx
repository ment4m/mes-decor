import React, { useState, useEffect, useCallback } from 'react'
import { EVENT_CATEGORIES } from './Hero'

interface FleetItem {
  id:       number
  category: string
  name:     string
  images:   string[]
}

const FLEET_ITEMS: FleetItem[] = [
  // Birthday
  { id:  1, category: 'Birthday',    name: 'Birthday Event 1', images: ['/birthday/birthday-event1-1.jpg', '/birthday/birthday-event1-2.jpg'] },
  { id:  2, category: 'Birthday',    name: 'Birthday Event 2', images: ['/birthday/birthday-event2-1.jpg', '/birthday/birthday-event2-2.jpg'] },
  { id:  3, category: 'Birthday',    name: 'Birthday Event 3', images: ['/birthday/birthday-event3-1.jpg', '/birthday/birthday-event3-2.jpg', '/birthday/birthday-event3-3.jpg'] },
  { id:  4, category: 'Birthday',    name: 'Birthday Event 4', images: ['/birthday/birthday-event4-1.jpg', '/birthday/birthday-event4-2.jpg'] },
  { id:  5, category: 'Birthday',    name: 'Birthday Event 5', images: ['/birthday/birthday-event5-1.jpg'] },
  { id:  6, category: 'Birthday',    name: 'Birthday Event 6', images: ['/birthday/birthday-event6-1.jpg'] },
  // Baby Shower
  { id:  7, category: 'Baby Shower', name: 'Baby Shower Setup', images: ['/baby-shower/babyShower-event1-1.jpg'] },
  // Christening
  { id:  8, category: 'Christening', name: 'Christening Event 1', images: ['/christening/christening-event1-1.jpg', '/christening/christening-event1-2.jpg'] },
  // Graduation
  { id:  9, category: 'Graduation',  name: 'Graduation Event 1', images: ['/graduation/graduation-event1-1.jpg', '/graduation/graduation-event1-2.jpg'] },
  { id: 10, category: 'Graduation',  name: 'Graduation Event 2', images: ['/graduation/graduation-event2-1.jpg'] },
  { id: 11, category: 'Graduation',  name: 'Graduation Event 3', images: ['/graduation/graduation-event3-1.jpg', '/graduation/graduation-event3-2.jpg', '/graduation/graduation-event3-3.jpg'] },
  // Others
  { id: 13, category: 'Others',      name: 'Special Event 1', images: ['/others/others-event1-1.jpg', '/others/others-event1-2.jpg'] },
  { id: 14, category: 'Others',      name: 'Special Event 2', images: ['/others/others-event2-1.jpg'] },
]

const FILTERS: string[] = ['All', ...EVENT_CATEGORIES]
const PAGE_SIZE = 6

// ── Lightbox ───────────────────────────────────────────────
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
    <div className="fixed inset-0 bg-[rgba(20,12,4,0.92)] backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-[820px] bg-dark rounded-[20px] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 z-10 bg-black/50 border-none text-off-white text-lg w-9 h-9 rounded-full cursor-pointer flex items-center justify-center hover:bg-black/80 transition-colors" onClick={onClose}>✕</button>
        <div className="w-full aspect-[4/3] overflow-hidden bg-dark-deep">
          <img src={item.images[slide]} alt={item.name} className="w-full h-full object-contain block" />
        </div>
        {item.images.length > 1 && (
          <>
            <button className="absolute top-1/2 left-3 -translate-y-[60%] bg-black/45 border-none text-off-white text-4xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-gold transition-colors z-10" onClick={prev}>‹</button>
            <button className="absolute top-1/2 right-3 -translate-y-[60%] bg-black/45 border-none text-off-white text-4xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-gold transition-colors z-10" onClick={next}>›</button>
          </>
        )}
        <div className="flex items-center justify-between px-5 py-3.5 gap-3">
          <span className="text-[15px] font-semibold text-off-white flex-1">{item.name}</span>
          {item.images.length > 1 && (
            <div className="flex gap-1.5">
              {item.images.map((_, i) => (
                <button key={i} className={`w-2 h-2 rounded-full border-none cursor-pointer p-0 transition-colors ${i === slide ? 'bg-gold' : 'bg-white/30'}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          )}
          <span className="text-[13px] text-text-muted whitespace-nowrap">{slide + 1} / {item.images.length}</span>
        </div>
      </div>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────
function FleetCard({ item, onOpen }: { item: FleetItem; onOpen: () => void }): React.ReactElement {
  const [slide, setSlide] = useState<number>(0)
  const hasMultiple = item.images.length > 1

  useEffect(() => {
    if (!hasMultiple) return
    const timer = setInterval(() => setSlide((prev) => (prev + 1) % item.images.length), 3000)
    return () => clearInterval(timer)
  }, [hasMultiple, item.images.length])

  return (
    <div
      className="rounded-card overflow-hidden text-left shadow-sm bg-off-white border border-border-col cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
      onClick={onOpen}
    >
      {/* fleet-card-img keeps animation CSS */}
      <div className="fleet-card-img">
        {item.images.map((src, i) => (
          <img key={src} src={src} alt={item.name} className={`fleet-card-slide${i === slide ? ' fleet-card-slide--active' : ''}`} />
        ))}
        {hasMultiple && (
          <div className="fleet-card-dots">
            {item.images.map((_, i) => (
              <span key={i} className={`fleet-card-dot${i === slide ? ' active' : ''}`} />
            ))}
          </div>
        )}
      </div>
      <div className="px-[18px] pt-3.5 pb-[18px]">
        <span className="text-[11px] text-gold uppercase tracking-[1.2px] font-bold">{item.category}</span>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function Fleet(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [lightboxItem, setLightboxItem] = useState<FleetItem | null>(null)

  const filtered     = activeFilter === 'All' ? FLEET_ITEMS : FLEET_ITEMS.filter((i) => i.category === activeFilter)
  const visibleItems = filtered.slice(0, visibleCount)
  const hasMore      = visibleCount < filtered.length

  const handleFilter = (f: string): void => { setActiveFilter(f); setVisibleCount(PAGE_SIZE) }

  return (
    <>
      <section className="px-12 tab:px-6 mob:px-4 pt-[72px] tab:pt-14 mob:pt-10 pb-14 mob:pb-8 text-center bg-cream" id="gallery">
        <h2 className="text-[34px] mob:text-2xl font-bold tracking-tight mb-3 text-text-dark">Discover Our Prestigious Decorations</h2>
        <p className="text-[14px] text-text-muted leading-relaxed mb-9">
          Explore our handpicked collection of luxury event decorations<br />
          each designed to make your event truly unforgettable.
        </p>

        {/* Filters */}
        <div className="flex justify-center gap-2 flex-wrap mb-11 mob:gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-[22px] mob:px-4 py-2 mob:py-1.5 mob:text-[12px] rounded-pill border text-[13px] font-medium cursor-pointer transition-all ${
                activeFilter === f
                  ? 'bg-dark text-off-white border-dark'
                  : 'bg-off-white text-text-muted border-border-col hover:border-gold hover:text-gold'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 tab:grid-cols-2 mob:grid-cols-1 gap-[22px] tab:gap-4 mob:gap-3 max-w-[1040px] mx-auto mb-10">
          {visibleItems.map((item) => (
            <FleetCard key={item.id} item={item} onOpen={() => setLightboxItem(item)} />
          ))}
        </div>

        {/* More / Less */}
        <div className="flex justify-center">
          <button
            className="inline-flex items-center gap-2.5 px-3 pl-[22px] py-2.5 rounded-pill border border-dark text-dark text-[14px] font-medium cursor-pointer hover:bg-dark hover:text-off-white transition-colors"
            onClick={() => hasMore ? setVisibleCount((c) => c + PAGE_SIZE) : setVisibleCount(PAGE_SIZE)}
          >
            {hasMore ? 'Show More Decorations' : 'Show Less'}
            <span className="w-8 h-8 rounded-full flex items-center justify-center border border-current">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </button>
        </div>
      </section>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </>
  )
}
