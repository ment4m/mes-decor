import React from 'react'

export default function About(): React.ReactElement {
  return (
    <section
      id="about"
      className="relative flex items-center justify-center text-center min-h-[400px] mob:min-h-[300px] px-12 tab:px-6 mob:px-4 py-[72px] tab:py-14 mob:py-12"
      style={{
        background: 'linear-gradient(rgba(30,21,8,0.70), rgba(30,21,8,0.70)), url("https://picsum.photos/seed/aboutdecor/1400/600") center / cover no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 max-w-[600px]">
        <h2 className="text-4xl tab:text-[30px] mob:text-2xl font-bold text-off-white mb-6">About Us</h2>
        <p className="text-[15px] mob:text-[14px] text-white/85 leading-relaxed mb-9">
          At <span className="text-gold">Mes Decor</span>, we redefine event decoration
          with a curated{' '}
          <span className="text-gold">selection of luxury and premium decor</span>.
          Our mission is to deliver an unforgettable experience where{' '}
          <span className="text-gold">elegance</span>, style, and{' '}
          <span className="text-gold">sophistication meet</span>.
        </p>
      </div>
    </section>
  )
}
