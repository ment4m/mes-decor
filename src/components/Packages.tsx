import React from 'react'

interface Package {
  id:       number
  price:    number
  image:    string
  includes: string[]
  tag?:     string
}

const PACKAGES: Package[] = [
  {
    id:    1,
    price: 200,
    image: '/packages/packages1.jpg',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (1)',
      'Backdrop (1)',
    ],
  },
  {
    id:    2,
    price: 230,
    image: '/packages/packages2.jpg',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (2)',
      'Backdrop (1)',
    ],
  },
  {
    id:    3,
    price: 230,
    image: '/packages/packages3.png',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (2)',
      'Backdrop (1)',
    ],
  },
  {
    id:    4,
    price: 260,
    image: '/packages/packages4.png',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (1)',
      'Backdrop (2)',
    ],
  },
  {
    id:    5,
    price: 280,
    image: '/packages/packages5.jpg',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (2)',
      'Backdrop (2)',
    ],
  },
  {
    id:    6,
    price: 290,
    image: '/packages/packages6.jpg',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (1)',
      'Backdrop (1)',
      'Shimmer Wall (1)',
    ],
  },
  {
    id:    7,
    price: 270,
    image: '/packages/packages7.jpg',
    includes: [
      'Custom Vinyl Print',
      'Balloon Garland (2)',
      'Backdrop (1)',
      'Shimmer Wall (2)',
    ],
  },
]

export default function Packages(): React.ReactElement {
  const handleBook = (pkg: Package): void => {
    const p = new URLSearchParams({
      total:             String(pkg.price),
      item:              `$${pkg.price} Package`,
      image:             pkg.image,
      freeDeliveryMiles: '10',
    })
    window.location.href = `/pay?${p.toString()}`
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-16 mob:py-10">

      {/* Header */}
      <div className="text-center mb-12 mob:mb-8">
        <img
          src="/logo.png"
          alt="Mes Decor"
          className="w-14 h-14 rounded-full border-2 border-gold mx-auto mb-4 cursor-pointer"
          onClick={() => { window.location.href = '/' }}
        />
        <p className="text-[12px] font-bold tracking-[3px] uppercase text-gold mb-1">Mes Decor</p>
        <h1 className="text-[36px] mob:text-[28px] font-bold text-text-dark leading-tight">Packages</h1>
        <p className="text-text-muted text-[15px] mob:text-[14px] mt-2 max-w-[420px] mx-auto">
          All packages are customized to your theme & occasion.
        </p>
      </div>

      {/* Grid — 3 cols desktop, 1 col mobile as horizontal cards */}
      <div className="max-w-[900px] mx-auto grid grid-cols-3 mob:grid-cols-1 gap-6 mob:gap-3">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-[20px] border border-border-col overflow-hidden shadow-sm flex flex-col mob:flex-row"
          >
            {/* Image — 60% width on mobile */}
            <div className="relative mob:w-[60%] mob:flex-shrink-0">
              <img
                src={pkg.image}
                alt={`Package $${pkg.price}`}
                className="w-full h-[260px] mob:h-full object-cover block"
              />
              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent mob:bg-gradient-to-r" />

              {pkg.tag && (
                <span className="absolute top-3 left-3 bg-gold text-off-white text-[11px] font-bold px-3 py-1 rounded-full z-10">
                  {pkg.tag}
                </span>
              )}

              {/* Price */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
                <p className="text-gold text-[32px] mob:text-[20px] font-bold leading-none drop-shadow-sm">${pkg.price}</p>
              </div>
            </div>

            {/* Content — 40% width on mobile */}
            <div className="px-4 py-4 mob:px-3 mob:py-3 flex flex-col gap-3 flex-1">
              <ul className="flex flex-col gap-1.5 flex-1">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] mob:text-[11px] text-text-mid">
                    <span className="text-gold mt-[1px] flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBook(pkg)}
                className="w-full py-2.5 mob:py-2 rounded-pill bg-gold text-off-white font-semibold text-[13px] mob:text-[11px] border-none cursor-pointer hover:bg-gold-dark transition-colors"
              >
                Book This Package
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info section */}
      <div className="max-w-[900px] mx-auto mt-12 bg-white rounded-[24px] border border-border-col px-8 mob:px-5 py-8 flex flex-col gap-5">
        <p className="text-[12px] font-bold tracking-[3px] uppercase text-gold text-center">Good to Know</p>

        <div className="grid grid-cols-2 mob:grid-cols-1 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-[22px] mt-0.5">🎈</span>
            <div>
              <p className="text-[13px] font-bold text-text-dark mb-0.5">Balloon Colors</p>
              <p className="text-[13px] text-text-muted leading-relaxed">Each package includes up to 3 balloon colors of your choice.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[22px] mt-0.5">✨</span>
            <div>
              <p className="text-[13px] font-bold text-text-dark mb-0.5">Add-Ons Available</p>
              <p className="text-[13px] text-text-muted leading-relaxed">Add-ons are available for any package to customize your setup at an extra charge.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[22px] mt-0.5">🚚</span>
            <div>
              <p className="text-[13px] font-bold text-text-dark mb-0.5">Delivery & Pickup</p>
              <p className="text-[13px] text-text-muted leading-relaxed">Delivery within 10 miles is free. Beyond that, a fee is calculated based on distance for delivery & pickup.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[22px] mt-0.5">🔧</span>
            <div>
              <p className="text-[13px] font-bold text-text-dark mb-0.5">Installation Included</p>
              <p className="text-[13px] text-text-muted leading-relaxed">Full setup and takedown is included in every package at no extra cost.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-col pt-5 text-center">
          <p className="text-[14px] font-bold text-text-dark leading-relaxed">
            To secure your event date, a non-refundable deposit is required at the time of booking.
          </p>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center mt-10">
        <p className="text-text-muted text-[14px] mb-3">Have questions or need a custom package?</p>
        <a
          href="https://instagram.com/decorbymessi"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gold text-off-white font-semibold text-[14px] px-6 py-3 rounded-pill no-underline hover:bg-gold-dark transition-colors"
        >
          DM us on Instagram
        </a>
      </div>
    </div>
  )
}
