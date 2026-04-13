import React, { useState, useEffect } from 'react'

interface EventGroup {
  key:      string
  category: string
  images:   string[]
}

const GROUPS: EventGroup[] = [
  { key: 'Birthday 1',    category: 'Birthday',    images: ['/birthday/birthday-event1-1.jpg', '/birthday/birthday-event1-2.jpg'] },
  { key: 'Birthday 2',    category: 'Birthday',    images: ['/birthday/birthday-event2-1.jpg', '/birthday/birthday-event2-2.jpg'] },
  { key: 'Birthday 3',    category: 'Birthday',    images: ['/birthday/birthday-event3-1.jpg', '/birthday/birthday-event3-2.jpg', '/birthday/birthday-event3-3.jpg'] },
  { key: 'Birthday 4',    category: 'Birthday',    images: ['/birthday/birthday-event4-1.jpg', '/birthday/birthday-event4-2.jpg'] },
  { key: 'Birthday 5',    category: 'Birthday',    images: ['/birthday/birthday-event5-1.jpg'] },
  { key: 'Birthday 6',    category: 'Birthday',    images: ['/birthday/birthday-event6-1.jpg'] },
  { key: 'Baby Shower',   category: 'Baby Shower', images: ['/baby-shower/babyShower-event1-1.jpg'] },
  { key: 'Christening',   category: 'Christening', images: ['/christening/christening-event1-1.jpg', '/christening/christening-event1-2.jpg'] },
  { key: 'Graduation 1',  category: 'Graduation',  images: ['/graduation/graduation-event1-1.jpg', '/graduation/graduation-event1-2.jpg'] },
  { key: 'Graduation 2',  category: 'Graduation',  images: ['/graduation/graduation-event2-1.jpg'] },
  { key: 'Graduation 3',  category: 'Graduation',  images: ['/graduation/graduation-event3-1.jpg', '/graduation/graduation-event3-2.jpg', '/graduation/graduation-event3-3.jpg'] },
  { key: 'Others 1',      category: 'Others',      images: ['/others/others-event1-1.jpg', '/others/others-event1-2.jpg'] },
  { key: 'Others 2',      category: 'Others',      images: ['/others/others-event2-1.jpg'] },
]

// ── Lightbox ───────────────────────────────────────────────
function Lightbox({ group, onClose }: { group: EventGroup; onClose: () => void }): React.ReactElement {
  const [slide, setSlide] = useState(0)
  const total = group.images.length

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') setSlide((s) => (s + 1) % total)
      if (e.key === 'ArrowLeft')  setSlide((s) => (s - 1 + total) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, total])

  return (
    <div className="fixed inset-0 bg-[rgba(10,3,22,0.93)] backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-[820px] bg-dark rounded-[20px] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 z-10 bg-black/50 border-none text-off-white text-lg w-9 h-9 rounded-full cursor-pointer flex items-center justify-center hover:bg-black/80 transition-colors" onClick={onClose}>✕</button>

        <div className="w-full aspect-[4/3] overflow-hidden bg-dark-deep relative">
          <img src={group.images[slide]} alt={group.key} className="w-full h-full object-contain block" />
          {total > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/45 border-none text-off-white text-4xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-gold transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setSlide((s) => (s - 1 + total) % total) }}>‹</button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/45 border-none text-off-white text-4xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-gold transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setSlide((s) => (s + 1) % total) }}>›</button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 gap-3">
          {total > 1 ? (
            <div className="flex gap-1.5">
              {group.images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setSlide(i) }}
                  className={`h-2 rounded-full border-none cursor-pointer p-0 transition-all duration-300 ${i === slide ? 'bg-gold w-5' : 'bg-white/30 w-2'}`} />
              ))}
            </div>
          ) : <span />}
          {total > 1 && <span className="text-[13px] text-text-muted whitespace-nowrap">{slide + 1} / {total}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function Fleet(): React.ReactElement {
  const [lightboxGroup, setLightboxGroup] = useState<EventGroup | null>(null)
  const [paused,        setPaused]        = useState(false)

  const track = [...GROUPS, ...GROUPS]

  return (
    <>
      <section className="pt-[72px] tab:pt-14 mob:pt-10 pb-14 mob:pb-8 text-center bg-cream overflow-hidden" id="gallery">
        <h2 className="text-[34px] mob:text-2xl font-bold tracking-tight mb-3 text-text-dark px-12 tab:px-6 mob:px-4">
          Discover Our Prestigious Decorations
        </h2>
        <p className="text-[14px] text-text-muted leading-relaxed mb-9 px-12 tab:px-6 mob:px-4">
          Explore our handpicked collection of luxury event decorations.<br />
          Click any photo to view the full set.
        </p>

        <div
          className="relative w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #F2EDD8, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #F2EDD8, transparent)' }} />

          {/* Scrolling track */}
          <div
            className="flex gap-5"
            style={{
              animation: `gallery-scroll ${GROUPS.length * 4}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {track.map((group, i) => (
              <div
                key={`${group.key}-${i}`}
                className="relative flex-shrink-0 w-[340px] tab:w-[260px] mob:w-[200px] rounded-card overflow-hidden shadow-sm border border-border-col bg-off-white cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                onClick={() => setLightboxGroup(group)}
              >
                <div className="h-[260px] tab:h-[200px] mob:h-[150px] overflow-hidden">
                  <img src={group.images[0]} alt={group.key} draggable={false} className="w-full h-full object-cover block" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Single Get a Quote button */}
        <div className="flex justify-center mt-10">
          <button
            className="flex items-center gap-2.5 px-5 pl-[22px] py-3 rounded-pill bg-dark text-off-white text-[14px] font-semibold border-none cursor-pointer hover:bg-gold transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Get a Quote
            <span className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </button>
        </div>
      </section>

      {lightboxGroup && <Lightbox group={lightboxGroup} onClose={() => setLightboxGroup(null)} />}
    </>
  )
}
