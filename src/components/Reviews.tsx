import React, { useState, useEffect } from 'react'
import { fetchApprovedReviews, submitReview, type Review } from '../lib/airtable'

function Stars({ rating, interactive = false, onChange }: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
}): React.ReactElement {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-2xl border-none bg-transparent p-0 leading-none transition-colors ${
            interactive ? 'cursor-pointer' : 'cursor-default'
          } ${n <= (hovered || rating) ? 'text-gold' : 'text-border-col'}`}
        >★</button>
      ))}
    </div>
  )
}

// ── Review Form ────────────────────────────────────────────
export function ReviewForm(): React.ReactElement {
  const [rating,    setRating]    = useState(5)
  const [name,      setName]      = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [comment,   setComment]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!comment.trim()) return
    setLoading(true)
    setError(false)
    try {
      await submitReview({ name: anonymous ? '' : name, rating, comment })
      setDone(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="text-center py-10">
      <p className="text-4xl mb-3">🌸</p>
      <p className="text-text-dark font-bold text-[18px] mb-1">Thank you for your review!</p>
      <p className="text-text-muted text-[14px]">We appreciate your feedback. It will be published shortly.</p>
    </div>
  )

  return (
    <div className="w-full max-w-[520px] mx-auto bg-white rounded-[20px] shadow-sm border border-border-col px-6 mob:px-4 py-7 flex flex-col gap-5">
      <div className="flex flex-col items-center text-center">
        <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Your Rating*</p>
        <Stars rating={rating} interactive onChange={setRating} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Your Name</p>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="accent-gold" />
            <span className="text-[12px] text-text-muted">Stay anonymous</span>
          </label>
        </div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          disabled={anonymous}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[14px] text-text-dark outline-none focus:border-gold disabled:opacity-40 disabled:bg-cream transition-colors"
        />
      </div>

      <div>
        <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Your Comment*</p>
        <textarea
          placeholder="Share your experience…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full border border-border-col rounded-[10px] px-3 py-2.5 text-[14px] text-text-dark outline-none focus:border-gold resize-none transition-colors"
        />
      </div>

      {error && <p className="text-red-500 text-[13px]">Something went wrong. Please try again.</p>}

      <button
        onClick={() => void handleSubmit()}
        disabled={loading || !comment.trim()}
        className="w-full py-3 rounded-pill bg-gold text-off-white font-semibold text-[14px] border-none cursor-pointer hover:bg-gold-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}

// ── Reviews Display ────────────────────────────────────────
export default function Reviews(): React.ReactElement {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedReviews()
      .then(setReviews)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-cream px-12 tab:px-6 mob:px-4 py-16 tab:py-12 mob:py-10" id="reviews">
      {/* Display */}
      <div className="max-w-[1000px] mx-auto mb-16">
        <h2 className="text-[34px] mob:text-2xl font-bold tracking-tight mb-3 text-text-dark text-center">What Our Clients Say</h2>
        <p className="text-[14px] text-text-muted leading-relaxed mb-10 text-center">
          Real experiences from real clients.
        </p>

        {loading ? (
          <p className="text-center text-text-muted py-8">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-text-muted py-8">No reviews yet — be the first!</p>
        ) : (
          <div className="overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-[16px] px-5 py-5 border border-border-col shadow-sm flex flex-col gap-3 w-[280px] flex-shrink-0">
                  <div className="flex justify-center"><Stars rating={r.rating} /></div>
                  <p className="text-text-dark text-[14px] leading-relaxed flex-1 text-center">"{r.comment}"</p>
                  <p className="text-gold font-bold text-[13px] text-center">{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border-col max-w-[1000px] mx-auto mb-16" />

      {/* Submit form */}
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-[28px] mob:text-xl font-bold tracking-tight mb-2 text-text-dark text-center">Leave a Review</h2>
        <p className="text-[14px] text-text-muted mb-8 text-center">
          Had an event with us? We'd love to hear from you.
        </p>
        <ReviewForm />
      </div>
    </section>
  )
}
