import React from 'react'
import { useState } from 'react'
import { Plus, Minus } from './icons'

// ── Types ──────────────────────────────────────────────────
interface FaqItem {
  id: number
  question: string
  answer: string
}

// ── Data ───────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
  { id: 1, question: 'Is this service only for weddings?',         answer: 'No! While weddings are our specialty, we also provide decor for birthdays, corporate events, photo shoots, engagements, and any special occasion.' },
  { id: 2, question: 'Do all setups come with an installation team?', answer: 'Yes, every package includes a professional installation and breakdown crew. We handle everything so you can focus on enjoying your event.' },
  { id: 3, question: 'How do I reserve a decoration package?',     answer: 'Simply fill out the booking form on our website or contact us directly. We recommend booking at least 4-6 weeks in advance for full customization.' },
  { id: 4, question: 'How far in advance should I book?',          answer: 'For weddings and large events, we recommend booking 2-3 months ahead. For smaller setups, 2-4 weeks is usually sufficient.' },
  { id: 5, question: 'What is included in a package?',             answer: 'All packages include decor items, delivery, professional setup, and post-event removal. Custom floral arrangements will be quoted separately upon request.' },
  { id: 6, question: 'What are the payment methods?',              answer: 'We accept credit/debit cards, bank transfers, and cash payments. A deposit is required to secure your booking date.' },
  { id: 7, question: 'Can I request custom decoration themes?',    answer: 'Absolutely! We love bringing unique visions to life. Share your inspiration and our design team will create a personalized proposal for you.' },
  { id: 8, question: 'Is the service available for destination events?', answer: 'Yes, we cater to destination events. Travel and logistics fees may apply depending on the location. Contact us to discuss your event.' },
]

// ── Component ──────────────────────────────────────────────
export default function FAQs(): React.ReactElement {
  const [openId, setOpenId] = useState<number | null>(null)

  const toggle = (id: number): void => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className="faqs-section" id="faqs">
      <h2 className="faqs-title">FAQs</h2>

      <div className="faqs-list">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id
          return (
            <div key={item.id} className="faq-item">
              <button className="faq-question" onClick={() => toggle(item.id)}>
                <span>{item.question}</span>
                <span className="faq-icon">{isOpen ? <Minus /> : <Plus />}</span>
              </button>
              {isOpen && <p className="faq-answer">{item.answer}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
