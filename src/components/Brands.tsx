import React from 'react'
interface Brand {
  name: string
  icon: string
}

const BRANDS: Brand[] = [
  { name: 'Petal & Bloom',   icon: '✿' },
  { name: 'Luxe Events',     icon: '◈' },
  { name: 'Golden Touch',    icon: '❋' },
  { name: 'Ivory & Rose',    icon: '✦' },
  { name: 'Crystal Decor',   icon: '◇' },
  { name: 'Elite Rentals',   icon: '❖' },
  { name: 'Prestige Events', icon: '✧' },
  { name: 'Velvet Touch',    icon: '❀' },
  { name: 'Opulent Style',   icon: '⊛' },
]

export default function Brands(): React.ReactElement {
  return (
    <div className="brands-section">
      {BRANDS.map(({ name, icon }) => (
        <div key={name} className="brand-item">
          <span className="brand-icon">{icon}</span>
          <span className="brand-name">{name}</span>
        </div>
      ))}
    </div>
  )
}
