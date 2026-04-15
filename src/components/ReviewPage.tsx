import React from 'react'
import { ReviewForm } from './Reviews'

export default function ReviewPage(): React.ReactElement {
  const params    = new URLSearchParams(window.location.search)
  const image     = params.get('image') ?? undefined
  const item      = params.get('item')  ?? undefined

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 mob:px-3 py-12">

      {/* Brand */}
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="Mes Decor"
          className="w-14 h-14 rounded-full border-2 border-gold mx-auto mb-3 cursor-pointer"
          onClick={() => { window.location.href = '/' }}
        />
        <h1 className="text-[26px] mob:text-[22px] font-bold text-text-dark">Leave a Review</h1>
        {item && <p className="text-text-muted text-[14px] mt-1">{item}</p>}
        {!item && <p className="text-text-muted text-[14px] mt-1">We'd love to hear about your experience</p>}
      </div>

      <ReviewForm imageOverride={image} />

    </div>
  )
}
