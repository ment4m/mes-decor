import './App.css'

import Navbar         from './components/Navbar'
import Hero           from './components/Hero'
import Fleet          from './components/Fleet'
import Experience     from './components/Experience'
import About          from './components/About'
import Reviews        from './components/Reviews'
import QuoteSection   from './components/QuoteSection'
import Contact        from './components/Contact'
import PaymentSuccess from './components/PaymentSuccess'
import Admin          from './components/Admin'
import PayPage        from './components/PayPage'
import ReviewPage     from './components/ReviewPage'

const path = window.location.pathname

export default function App() {
  if (path === '/payment-success') return <PaymentSuccess />
  if (path === '/admin')           return <Admin />
  if (path === '/pay')             return <PayPage />

  if (path === '/review') return <ReviewPage />

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
