import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, total, discountCode, discountResult, finalAmount } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', phone: '' })

  const emoji = (name) => name === 'Laptop' ? '??' : name === 'Phone' ? '??' : '??'

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const placeOrder = () => {
    if (!form.name || !form.email || !form.address || !form.city || !form.phone) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')

    const item = cart[0]
    axios.post('http://localhost:5004/payment', {
      product_id: item.product_id,
      quantity: item.quantity,
      ...(discountCode && { discount_code: discountCode })
    })
    .then(res => {
      navigate('/order-confirmed', { state: { result: res.data, form } })
    })
    .catch(() => {
      setError('? Payment failed. Please try again.')
      setLoading(false)
    })
  }

  if (!cart) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">No order found.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white py-2 px-6 rounded-xl">Go Shopping</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-400">Enter your details to place the order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Delivery Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5">Delivery Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Albin Shaji"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <input name="email" value={form.email} onChange={handleChange}
                placeholder="albin@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="123, Main Street"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">City</label>
              <input name="city" value={form.city} onChange={handleChange}
                placeholder="Palakkad"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emoji(item.product_name)}</span>
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-green-400 font-bold">?{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}

            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">?{total?.toLocaleString()}</span>
              </div>
              {discountResult && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({discountResult.discount_percent}%)</span>
                  <span>- ?{discountResult.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-gray-700">
                <span>Total</span>
                <span className="text-green-400">?{finalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900 border border-red-600 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition text-lg"
          >
            {loading ? '? Placing Order...' : '? Place Order'}
          </button>

          <p className="text-center text-gray-500 text-xs mt-3">?? Secure checkout powered by SmartShop</p>
        </div>
      </div>
    </div>
  )
}
