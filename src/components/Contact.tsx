import React from 'react'
import { WhatsApp, Instagram, YouTube, Facebook, Pinterest } from './icons'

// ── Types ──────────────────────────────────────────────────
interface SocialIcon {
  Icon: () => React.ReactElement
  label: string
}

// ── Data ───────────────────────────────────────────────────
const FOOTER_NAV: string[] = ['About', 'Gallery', 'Contact']

const SOCIAL_ICONS: SocialIcon[] = [
  { Icon: WhatsApp,  label: 'WhatsApp'  },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: YouTube,   label: 'YouTube'   },
  { Icon: Facebook,  label: 'Facebook'  },
  { Icon: Pinterest, label: 'Pinterest' },
]

// ── Component ──────────────────────────────────────────────
export default function Contact(): React.ReactElement {
  return (
    <footer className="contact-section" id="contact">

      {/* Top: CTA + Contact Info */}
      <div className="contact-top">
        <div className="contact-left">
          <h2 className="contact-heading">
            Connect with Us Today
          </h2>
          <p className="contact-tagline">
            Have questions or need assistance? Our team is ready to help
            you create the perfect event experience.
          </p>
          <p className="contact-phone">+1 800 123 456</p>
        </div>

        <div className="contact-right">
          <div className="contact-ig">
            <Instagram />
            <div className="contact-ig-text">
              <span className="contact-ig-label">Follow us on Instagram</span>
              <span className="contact-ig-handle">@decorbymessi</span>
            </div>
          </div>
          <a href="https://instagram.com/decorbymessi" target="_blank" rel="noreferrer" className="contact-ig-qr">
            <img src="/ig-qr.png" alt="Scan to follow on Instagram" />
          </a>
        </div>
      </div>

      {/* Center: Footer Nav Pills */}
      <nav className="footer-nav">
        {FOOTER_NAV.map((link) => (
          <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="footer-nav-pill">
            {link}
          </a>
        ))}
      </nav>

      <hr className="footer-divider" />

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-logo-pill">
          <img src="/logo.png" alt="Mes Decor logo" className="footer-logo-img" />
          <span className="footer-logo-text"><span className="logo-script">Mes</span> <span className="logo-caps">DECOR</span></span>
        </div>

        <p className="footer-copyright">©2026 Mes Decor. All Rights Reserved.</p>

        <div className="footer-socials">
          {SOCIAL_ICONS.map(({ Icon, label }) => (
            <a key={label} href="#" aria-label={label} className="footer-social-icon">
              <Icon />
            </a>
          ))}
        </div>
      </div>

    </footer>
  )
}
