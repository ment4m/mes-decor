import React from 'react'

const NAV_LINKS: string[] = ['About', 'Gallery']

const handleGetQuote = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Navbar(): React.ReactElement {
  return (
    <nav className="flex items-center justify-between px-12 mob:px-5 h-16 mob:h-[58px] fixed top-0 left-0 right-0 z-[100] border-b border-border-col backdrop-blur-sm bg-[rgba(239,224,184,0.92)]">

      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => window.location.href = '/'}
      >
        <img src="/logo.png" alt="Mes Decor logo" className="w-10 h-10 object-contain rounded-full border-2 border-gold" />
        <span className="flex flex-col items-center leading-none">
          <span className="font-script text-xl mob:text-lg font-bold text-gold-dark leading-tight">Mes</span>
          <span className="text-[9px] font-bold tracking-[3px] text-text-dark uppercase">DECOR</span>
        </span>
      </div>

      <ul className="flex items-center list-none gap-9 mob:gap-[18px]">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="text-[13.5px] mob:text-[12px] font-medium text-text-mid no-underline hover:text-gold-dark transition-colors"
            >
              {link}
            </a>
          </li>
        ))}
        <li>
          <button
            className="bg-transparent border-none p-0 text-[13.5px] mob:text-[12px] font-semibold text-gold-dark cursor-pointer hover:text-gold transition-colors"
            onClick={handleGetQuote}
          >
            Get a Quote
          </button>
        </li>
      </ul>

    </nav>
  )
}
