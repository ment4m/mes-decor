import React from 'react'
import { WhatsApp, Instagram } from './icons'

interface SocialIcon {
  Icon: () => React.ReactElement
  label: string
  href: string
}

const SOCIAL_ICONS: SocialIcon[] = [
  { Icon: WhatsApp,  label: 'WhatsApp',  href: 'https://wa.me/19723755225'          },
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/decorbymessi' },
]

export default function Contact(): React.ReactElement {
  return (
    <footer className="bg-peach px-10 py-5" id="contact">

      <hr className="border-none border-t border-black/10 mb-6" />

      <div className="flex items-center justify-between flex-wrap gap-4">

        {/* Logo pill */}
        <div className="flex items-center gap-2 bg-gold text-off-white px-5 py-2.5 rounded-pill">
          <img src="/logo.png" alt="Mes Decor logo" className="w-8 h-8 object-contain rounded-full border-2 border-off-white bg-off-white" />
          <span className="flex flex-col items-center leading-none">
            <span className="font-script text-lg text-off-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>Mes</span>
            <span className="text-[9px] font-bold tracking-[3px] text-off-white uppercase">DECOR</span>
          </span>
        </div>

        <p className="text-[13px] text-text-muted">©2026 Mes Decor. All Rights Reserved.</p>

        {/* Social icons */}
        <div className="flex gap-2">
          {SOCIAL_ICONS.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
              className="w-[38px] h-[38px] rounded-full bg-gold text-cream flex items-center justify-center no-underline hover:bg-gold-dark transition-colors"
            >
              <Icon />
            </a>
          ))}
        </div>

      </div>
    </footer>
  )
}
