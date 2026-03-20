import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:5001/inventory')
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    axios.post('http://localhost:5002/cart', {
      product_id: product.id,
      quantity: 1
    })
    .then(() => {
      setMessage(`✅ ${product.name} added to cart!`)
      setTimeout(() => setMessage(''), 3000)
    })
    .catch(() => setMessage('❌ Failed to add to cart'))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">🏪 Inventory</h1>
      <p className="text-gray-400 mb-6">Browse available products</p>

      {message && (
        <div className="mb-4 px-4 py-3 bg-green-900 border border-green-600 rounded-lg text-green-300">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="text-4xl mb-4">
                {product.name === 'Laptop' ? '💻' : product.name === 'Phone' ? '📱' : '🎧'}
              </div>
              <h2 className="text-xl font-bold mb-1">{product.name}</h2>
              <p className="text-green-400 text-lg font-semibold mb-1">₹{Number(product.price).toLocaleString()}</p>
              <p className="text-gray-400 text-sm mb-4">Stock: {product.quantity} units</p>
              <button
                onClick={() => addToCart(product)}
                disabled={product.quantity === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => navigate('/cart')}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          View Cart →
        </button>
      </div>
    </div>
  )
}