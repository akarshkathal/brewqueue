import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Shop } from '../types'

export default function CustomerJoin() {
  // useParams reads the :slug from the URL
  // e.g. /shop/blue-bottle → slug = 'blue-bottle'
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  // State for the shop info
  const [shop, setShop] = useState<Shop | null>(null)

  // State for the form fields
  const [customerName, setCustomerName] = useState('')
  const [partySize, setPartySize] = useState(1)

  // State for loading indicators
  const [loadingShop, setLoadingShop] = useState(true)
  const [joining, setJoining] = useState(false)

  // Fetch shop info when the page loads
  useEffect(() => {
    async function fetchShop() {
      try {
        const response = await api.get(`/api/queue/${slug}`)
        setShop(response.data.shop)
      } catch (err) {
        toast.error('Shop not found')
      } finally {
        setLoadingShop(false)
      }
    }
    fetchShop()
  }, [slug])
  // The [slug] at the end means: re-run this effect if slug changes
  // On first load slug comes from the URL and doesn't change
  // but it's good practice to include it as a dependency

  async function handleJoin() {
    // Basic validation before hitting the API
    if (!customerName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setJoining(true)
    try {
      const response = await api.post(`/api/queue/${slug}/join`, {
        customer_name: customerName.trim(),
        party_size: partySize
      })

      // After joining, navigate to the status page
      // We use the entry ID returned from the API
      const entryId = response.data.entry.id
      toast.success('You joined the queue!')
      navigate(`/shop/${slug}/status/${entryId}`)

    } catch (err: any) {
      // err.response.data.message is the error message from our backend
      toast.error(err.response?.data?.message || 'Failed to join queue')
    } finally {
      setJoining(false)
    }
  }

  // Show loading state while fetching shop
  if (loadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-amber-600 text-lg">Loading...</div>
      </div>
    )
  }

  // Show error if shop not found
  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-red-500 text-lg">Shop not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">

      {/* Shop Header */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">☕</div>
        <h1 className="text-3xl font-bold text-amber-900">{shop.name}</h1>

        {/* Open/Closed Badge */}
        <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
          shop.is_open
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {shop.is_open ? '🟢 Open' : '🔴 Closed'}
        </div>
      </div>

      {/* Join Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {shop.is_open ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Join the Queue
            </h2>

            {/* Estimated Wait */}
            <div className="bg-amber-50 rounded-lg p-3 mb-6 text-center">
              <span className="text-amber-700 text-sm">
                ⏱ Estimated wait: ~{shop.avg_wait_minutes} min per person
              </span>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 
                           focus:outline-none focus:ring-2 focus:ring-amber-400
                           text-gray-800"
                // Allow pressing Enter to submit
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            {/* Party Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Size
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 
                             font-bold text-xl hover:bg-amber-200 transition"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-gray-800 w-8 text-center">
                  {partySize}
                </span>
                <button
                  onClick={() => setPartySize(Math.min(10, partySize + 1))}
                  className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 
                             font-bold text-xl hover:bg-amber-200 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                         text-white font-semibold py-4 rounded-xl text-lg
                         transition duration-200"
            >
              {joining ? 'Joining...' : 'Join Queue'}
            </button>
          </>
        ) : (
          // Shop is closed
          <div className="text-center py-6">
            <div className="text-4xl mb-3">😔</div>
            <p className="text-gray-600 text-lg">
              Sorry, this shop is currently closed.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}