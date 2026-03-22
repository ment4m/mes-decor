import './App.css'

import Navbar         from './components/Navbar'
import Hero           from './components/Hero'
import Fleet          from './components/Fleet'
import Experience     from './components/Experience'
import About          from './components/About'
import QuoteSection   from './components/QuoteSection'
import Contact        from './components/Contact'
import PaymentSuccess from './components/PaymentSuccess'
import Admin          from './components/Admin'

const path = window.location.pathname

export default function App() {
  if (path === '/payment-success') return <PaymentSuccess />
  if (path === '/admin')           return <Admin />

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
