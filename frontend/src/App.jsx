import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmed from './pages/OrderConfirmed'

export default function App() {
  const [cartCount, setCartCount] = useState(0)

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Products setCartCount={setCartCount} />} />
          <Route path="/cart" element={<Cart setCartCount={setCartCount} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
        </Routes>
      </div>
    </Router>
  )
}