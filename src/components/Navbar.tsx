import React from 'react'

const NAV_LINKS: string[] = ['About', 'Gallery']

const handleGetQuote = (): void => {
  const isMobile = window.innerWidth <= 900
  const id = isMobile ? 'quote-section' : 'booking-form'
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar(): React.ReactElement {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="Mes Decor logo" className="logo-img" />
        <span className="logo-text"><span className="logo-script">Mes</span> <span className="logo-caps">DECOR</span></span>
      </div>

      <ul className="navbar-links">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase().replace(' ', '-')}`}>{link}</a>
          </li>
        ))}
        <li>
          <button className="navbar-quote-btn" onClick={handleGetQuote}>Get a Quote</button>
        </li>
      </ul>

    </nav>
  )
}
