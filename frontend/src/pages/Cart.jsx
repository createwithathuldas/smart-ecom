import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Cart({ setCartCount }) {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5002/cart')
      .then(res => {
        setCart(res.data.cart_items)
        setTotal(res.data.total)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const applyDiscount = () => {
    if (!discountCode) return
    axios.post('http://localhost:5003/discount', { code: discountCode, original_price: total })
      .then(res => {
        if (res.data.discount_percent === 0) {
          setMessage({ text: '❌ Invalid discount code', type: 'error' })
          setDiscountResult(null)
        } else {
          setDiscountResult(res.data)
          setMessage({ text: `✅ ${discountCode} applied — ${res.data.discount_percent}% off!`, type: 'success' })
        }
      })
  }

  const emoji = (name) => name === 'Laptop' ? '💻' : name === 'Phone' ? '📱' : '🎧'
  const finalAmount = discountResult ? discountResult.final_price : total

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-400">Review your items before checkout</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading cart...</p>
      ) : cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-400 text-xl mb-6">Your cart is empty</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition">
            Shop Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl bg-gray-800 p-3 rounded-xl">{emoji(item.product_name)}</div>
                  <div>
                    <h3 className="font-bold text-lg">{item.product_name}</h3>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                    <p className="text-gray-400 text-sm">₹{Number(item.price).toLocaleString()} each</p>
                  </div>
                </div>
                <p className="text-green-400 font-bold text-xl">
                  ₹{(Number(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}

            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 text-sm transition">
              ← Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">₹{total.toLocaleString()}</span>
              </div>
              {discountResult && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({discountResult.discount_percent}%)</span>
                  <span>- ₹{discountResult.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-700">
                <span>Total</span>
                <span className="text-green-400">₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Discount Code */}
            <div className="mb-5">
              <p className="text-sm text-gray-400 mb-2">Have a coupon?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="NEWYEAR"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={applyDiscount}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-3 py-2 rounded-xl text-sm transition"
                >
                  Apply
                </button>
              </div>
              {message.text && (
                <p className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { cart, total, discountCode: discountResult ? discountCode : null, discountResult, finalAmount } })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}