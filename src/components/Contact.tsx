import React from 'react'
import { WhatsApp, Instagram } from './icons'

// ── Types ──────────────────────────────────────────────────
interface SocialIcon {
  Icon: () => React.ReactElement
  label: string
  href: string
}

// ── Data ───────────────────────────────────────────────────
const SOCIAL_ICONS: SocialIcon[] = [
  { Icon: WhatsApp,  label: 'WhatsApp',  href: 'https://wa.me/19723755225'          },
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/decorbymessi' },
]

// ── Component ──────────────────────────────────────────────
export default function Contact(): React.ReactElement {
  return (
    <footer className="contact-section" id="contact">

      <hr className="footer-divider" />

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-logo-pill">
          <img src="/logo.png" alt="Mes Decor logo" className="footer-logo-img" />
          <span className="footer-logo-text"><span className="logo-script">Mes</span> <span className="logo-caps">DECOR</span></span>
        </div>

        <p className="footer-copyright">©2026 Mes Decor. All Rights Reserved.</p>

        <div className="footer-socials">
          {SOCIAL_ICONS.map(({ Icon, label, href }) => (
            <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="footer-social-icon">
              <Icon />
            </a>
          ))}
        </div>
      </div>

    </footer>
  )
}
