import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function OrderConfirmed() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, form } = location.state || {}
  const [orderId] = useState(() => Math.floor(Math.random() * 900000) + 100000)

  useEffect(() => {
    if (!result) navigate('/')
  }, [])

  if (!result) return null

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 text-center">

      {/* Success Animation */}
      <div className="text-8xl mb-6 animate-bounce">??</div>
      <h1 className="text-4xl font-bold text-green-400 mb-2">Order Confirmed!</h1>
      <p className="text-gray-400 mb-8">Thank you {form?.name}! Your order has been placed successfully.</p>

      {/* Order ID */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <p className="text-gray-400 text-sm">Order ID</p>
        <p className="text-2xl font-bold text-blue-400">#SS-{orderId}</p>
      </div>

      {/* Order Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left mb-6">
        <h2 className="text-xl font-bold mb-4">Order Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Product</span>
            <span className="font-semibold">{result.product}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quantity</span>
            <span>{result.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Original Price</span>
            <span>?{result.original_price?.toLocaleString()}</span>
          </div>
          {result.discount_applied > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount Applied</span>
              <span>- ?{result.discount_applied?.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-700">
            <span>Amount Paid</span>
            <span className="text-green-400">?{result.final_amount?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left mb-8">
        <h2 className="text-xl font-bold mb-4">Delivery To</h2>
        <div className="space-y-1 text-gray-300">
          <p className="font-semibold">{form?.name}</p>
          <p>{form?.address}, {form?.city}</p>
          <p>{form?.email}</p>
          <p>{form?.phone}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex justify-center gap-4 mb-8">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-lg">?</div>
          <span className="text-xs text-gray-400">Order Placed</span>
        </div>
        <div className="flex-1 h-1 bg-gray-700 mt-5"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">??</div>
          <span className="text-xs text-gray-400">Packing</span>
        </div>
        <div className="flex-1 h-1 bg-gray-700 mt-5"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">??</div>
          <span className="text-xs text-gray-400">Shipping</span>
        </div>
        <div className="flex-1 h-1 bg-gray-700 mt-5"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">??</div>
          <span className="text-xs text-gray-400">Delivered</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl transition"
      >
        Continue Shopping
      </button>
    </div>
  )
}
