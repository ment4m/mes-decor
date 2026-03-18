import React, { useState, useEffect, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────
interface ExperienceItem {
  id:     number
  name:   string
  images: string[]
}

// ── Data ───────────────────────────────────────────────────
const ITEMS: ExperienceItem[] = [
  { id: 1, name: 'Serpentine Table',     images: ['/rental/rental1.jpg'] },
  { id: 2, name: 'Chiavari Chairs',      images: ['/rental/rental2.jpg'] },
  { id: 3, name: 'Grad Marquee Letters', images: ['/rental/rental3.jpg'] },
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

// ── Component ──────────────────────────────────────────────
export default function Experience(): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [lightboxItem, setLightboxItem] = useState<ExperienceItem | null>(null)

  const visibleItems = ITEMS.slice(0, visibleCount)
  const hasMore      = visibleCount < ITEMS.length

  return (
    <>
      <section className="bg-dark px-12 py-16 text-center">
        <h2 className="text-4xl font-bold text-off-white mb-3 tracking-tight">Rentals</h2>
        <p className="text-[14px] text-white/50 leading-relaxed mb-12">
          Browse our curated collection of premium rental pieces<br />
          everything you need to bring your vision to life.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-[1000px] mx-auto mb-10">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="relative rounded-card overflow-hidden h-[360px] cursor-pointer"
              onClick={() => setLightboxItem(item)}
            >
              <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover block transition-transform duration-500 hover:scale-105" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-3"
                style={{ background: 'linear-gradient(to top, rgba(30,21,8,0.88) 0%, rgba(30,21,8,0) 100%)' }}>
                <span className="text-[15px] font-semibold text-off-white">{item.name}</span>
                <button
                  className="flex items-center gap-2 px-3 py-2 pl-[18px] rounded-pill border border-white/60 bg-transparent text-off-white text-[13px] font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
                  onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                  Get a Quote
                  <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gold border-gold border">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          {hasMore ? (
            <button
              className="inline-flex items-center gap-2.5 px-3 pl-[22px] py-2.5 rounded-pill border border-white/30 text-off-white text-[14px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              More Rentals
              <span className="w-8 h-8 rounded-full flex items-center justify-center border border-white/60 text-off-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </button>
          ) : (
            <button
              className="inline-flex items-center gap-2.5 px-3 pl-[22px] py-2.5 rounded-pill border border-white/30 text-off-white text-[14px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setVisibleCount(PAGE_SIZE)}
            >
              Show Less
              <span className="w-8 h-8 rounded-full flex items-center justify-center border border-white/60 text-off-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
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
