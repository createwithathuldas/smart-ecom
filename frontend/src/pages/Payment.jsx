import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, total, discountCode, discountResult } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const finalAmount = discountResult ? discountResult.final_price : total

  const processPayment = () => {
    if (!cart || cart.length === 0) return
    setLoading(true)
    const item = cart[0]

    axios.post('http://localhost:5004/payment', {
      product_id: item.product_id,
      quantity: item.quantity,
      ...(discountCode && { discount_code: discountCode })
    })
    .then(res => {
      setResult(res.data)
      setLoading(false)
    })
    .catch(() => {
      setError('❌ Payment failed. Please try again.')
      setLoading(false)
    })
  }

  if (!cart) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">No order found.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Go to Inventory
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">💳 Payment</h1>
      <p className="text-gray-400 mb-6">Review and confirm your order</p>

      {!result ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          {cart.map(item => (
            <div key={item.id} className="flex justify-between mb-3 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {item.product_name === 'Laptop' ? '💻' : item.product_name === 'Phone' ? '📱' : '🎧'}
                </span>
                <div>
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-green-400 font-semibold">₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}

          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-gray-400">
              <span>Original Price</span>
              <span>₹{total?.toLocaleString()}</span>
            </div>
            {discountResult && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({discountResult.discount_percent}% off)</span>
                <span>- ₹{discountResult.discount_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2">
              <span>Final Amount</span>
              <span className="text-green-400">₹{finalAmount?.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-900 border border-red-600 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={processPayment}
            disabled={loading}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition text-lg"
          >
            {loading ? 'Processing...' : '✅ Pay Now'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-green-700 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-6">Your order has been placed successfully.</p>

          <div className="bg-gray-800 rounded-lg p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Product</span>
              <span>{result.product}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Quantity</span>
              <span>{result.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Original Price</span>
              <span>₹{result.original_price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Discount Applied</span>
              <span>- ₹{result.discount_applied?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2">
              <span>Amount Paid</span>
              <span className="text-green-400">₹{result.final_amount?.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  )
}