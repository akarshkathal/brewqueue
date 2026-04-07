import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import socket from '../services/socket'
import { useAuth } from '../context/AuthContext'
import type { QueueEntry, Shop } from '../types'
import QRCodeDisplay from '../components/QRCodeDisplay'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function StaffDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [shop, setShop] = useState<Shop | null>(null)
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  // actionLoading stores the ID of the entry being acted on
  // so we can show a spinner on just that one button

  // Get the shop slug from the logged in user's shop
  // We'll fetch shop info using the shop ID
  const shopSlug = shop?.slug

  async function fetchQueue() {
    try {
      // We need the slug to fetch — get it from shop state
      // On first load we use the user's shopId to find the slug
      const response = await api.get(`/api/queue/${shopSlug || 'blue-bottle'}`)
      setShop(response.data.shop)
      setQueue(response.data.queue)
    } catch (err) {
      toast.error('Failed to load queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()

    // Connect socket and join shop room
    socket.connect()
    socket.emit('join:shop', shopSlug || 'blue-bottle')

    // Listen for real-time queue updates
    socket.on('queue:updated', (data: { queue: QueueEntry[] }) => {
      setQueue(data.queue)
    })

    // Listen for shop status changes
    socket.on('shop:status', (data: { isOpen: boolean }) => {
      setShop(prev => prev ? { ...prev, is_open: data.isOpen } : prev)
    })

    return () => {
      socket.off('queue:updated')
      socket.off('shop:status')
      socket.disconnect()
    }
  }, [])

  async function handleUpdateEntry(entryId: string, status: 'called' | 'served' | 'cancelled') {
    setActionLoading(entryId)
    try {
      await api.patch(`/api/queue/${shopSlug}/entry/${entryId}`, { status })

      const messages = {
        called: '📢 Customer called!',
        served: '✅ Marked as served',
        cancelled: '❌ Entry removed'
      }
      toast.success(messages[status])

    } catch (err) {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleToggleShop() {
    try {
      await api.patch(`/api/queue/${shopSlug}/toggle`)
      toast.success(shop?.is_open ? 'Shop closed' : 'Shop opened')
    } catch (err) {
      toast.error('Failed to toggle shop status')
    }
  }

  // Calculate how long someone has been waiting
  function getWaitTime(joinedAt: string): string {
    const minutes = Math.floor(
      (Date.now() - new Date(joinedAt).getTime()) / 60000
    )
    if (minutes < 1) return 'Just joined'
    return `${minutes} min ago`
  }

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
      </nav>
      <div className="max-w-2xl mx-auto p-6">
        <LoadingSkeleton />
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="font-bold text-gray-800">{shop?.name}</h1>
            <p className="text-gray-400 text-xs">Staff Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Shop Open/Close Toggle */}
          <button
            onClick={handleToggleShop}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              shop?.is_open
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {shop?.is_open ? '🔴 Close Shop' : '🟢 Open Shop'}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500
                       hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-amber-500">{queue.length}</p>
            <p className="text-gray-500 text-xs mt-1">In Queue</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-800">
              {shop?.avg_wait_minutes}m
            </p>
            <p className="text-gray-500 text-xs mt-1">Avg Wait</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-bold ${
              shop?.is_open ? 'text-green-500' : 'text-red-500'
            }`}>
              {shop?.is_open ? 'Open' : 'Closed'}
            </div>
            <p className="text-gray-500 text-xs mt-1">Status</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 text-sm">Live queue</span>
          <span className="text-gray-400 text-sm ml-auto">
            {queue.length} waiting
          </span>
        </div>

        {/* QR Code */}
        {shop && (
        <QRCodeDisplay
            shopSlug={shop.slug}
            shopName={shop.name}
        />
        )}
        {/* Queue List */}
        
        {queue.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-4xl mb-3">😌</div>
            <p className="text-gray-500 text-lg">Queue is empty</p>
            <p className="text-gray-400 text-sm mt-1">Enjoy the quiet ☕</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
              >
                {/* Position Number */}
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center
                                justify-center font-bold text-amber-600 shrink-0">
                  {index + 1}
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {entry.customer_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-400 text-xs">
                      👥 Party of {entry.party_size}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ⏱ {getWaitTime(entry.joined_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Call Button — notify customer it's their turn */}
                  <button
                    onClick={() => handleUpdateEntry(entry.id, 'called')}
                    disabled={actionLoading === entry.id}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600
                               disabled:bg-amber-300 text-white text-xs
                               font-medium rounded-lg transition"
                  >
                    {actionLoading === entry.id ? '...' : '📢 Call'}
                  </button>

                  {/* Serve Button — mark order complete */}
                  <button
                    onClick={() => handleUpdateEntry(entry.id, 'served')}
                    disabled={actionLoading === entry.id}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600
                               disabled:bg-green-300 text-white text-xs
                               font-medium rounded-lg transition"
                  >
                    {actionLoading === entry.id ? '...' : '✅ Serve'}
                  </button>

                  {/* Remove Button — cancel/remove from queue */}
                  <button
                    onClick={() => handleUpdateEntry(entry.id, 'cancelled')}
                    disabled={actionLoading === entry.id}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200
                               disabled:bg-red-50 text-red-500 text-xs
                               font-medium rounded-lg transition"
                  >
                    {actionLoading === entry.id ? '...' : '✕'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}