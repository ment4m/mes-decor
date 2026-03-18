import React from 'react'

const NAV_LINKS: string[] = ['About', 'Gallery', 'Contact']

export default function Navbar(): React.ReactElement {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="Mes Decor logo" className="logo-img" />
        <span className="logo-text"><span className="logo-script">Mes</span> <span className="logo-caps">DECOR</span></span>
      </div>

      <ul className="navbar-links">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase().replace(' ', '-')}`}>{link}</a>
          </li>
        ))}
      </ul>

    </nav>
  )
}
