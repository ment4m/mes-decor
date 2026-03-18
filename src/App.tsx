import React from 'react'
import './App.css'

import Navbar     from './components/Navbar'
import Hero       from './components/Hero'
import Fleet      from './components/Fleet'
import Experience from './components/Experience'
import About        from './components/About'
import QuoteSection from './components/QuoteSection'
import Contact      from './components/Contact'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Fleet />
      <Experience />
      <About />
      <QuoteSection />
      <Contact />
    </div>
  )
}
