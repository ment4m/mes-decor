import './App.css'

import Navbar         from './components/Navbar'
import Hero           from './components/Hero'
import Fleet          from './components/Fleet'
import Experience     from './components/Experience'
import About          from './components/About'
import Reviews        from './components/Reviews'
import { ReviewForm } from './components/Reviews'
import QuoteSection   from './components/QuoteSection'
import Contact        from './components/Contact'
import PaymentSuccess from './components/PaymentSuccess'
import Admin          from './components/Admin'

const path = window.location.pathname

export default function App() {
  if (path === '/payment-success') return <PaymentSuccess />
  if (path === '/admin')           return <Admin />

  // Shareable review link
  if (path === '/review') return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 mob:px-3 py-12">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="Mes Decor" className="w-14 h-14 rounded-full border-2 border-gold mx-auto mb-3" />
        <h1 className="text-[26px] mob:text-[22px] font-bold text-text-dark">Leave a Review</h1>
        <p className="text-text-muted text-[14px] mt-1">Thank you for choosing Mes Decor!</p>
      </div>
      <div className="w-full max-w-[520px]">
        <ReviewForm />
      </div>
    </div>
  )

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Experience />
      <Fleet />
      <About />
      <Reviews />
      <QuoteSection />
      <Contact />
    </div>
  )
}
