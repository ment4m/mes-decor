import React from 'react'

export default function About(): React.ReactElement {
  return (
    <section className="about-section" id="about">
      <div className="about-overlay" />
      <div className="about-content">
        <h2 className="about-title">About Us</h2>
        <p className="about-text">
          At <span className="about-highlight">Mes Decor</span>, we redefine event decoration
          with a curated{' '}
          <span className="about-highlight">selection of luxury and premium decor</span>.
          Our mission is to deliver an unforgettable experience where{' '}
          <span className="about-highlight">elegance</span>, style, and{' '}
          <span className="about-highlight">sophistication meet</span>.
        </p>
      </div>
    </section>
  )
}
