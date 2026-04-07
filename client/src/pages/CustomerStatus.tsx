import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import socket from '../services/socket'
import type { QueueEntry } from '../types'

interface StatusData {
  entry: QueueEntry
  position: number
  peopleAhead: number
  estimatedWaitMinutes: number
  shopIsOpen: boolean
}

export default function CustomerStatus() {
  const { slug, entryId } = useParams<{ slug: string; entryId: string }>()
  const navigate = useNavigate()

  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [called, setCalled] = useState(false)

  // Fetch current status from API
  async function fetchStatus() {
    try {
      const response = await api.get(`/api/queue/${slug}/status/${entryId}`)
      setStatusData(response.data)

      // If already called, show the called state
      if (response.data.entry.status === 'called') {
        setCalled(true)
      }
    } catch (err) {
      toast.error('Could not load your queue status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Connect to socket when this page loads
    socket.connect()

    // Join the shop room to get queue updates
    socket.emit('join:shop', slug)

    // Join our specific entry room to get called notification
    socket.emit('join:entry', entryId)

    // When the queue updates, refresh our status
    // This fires whenever anyone joins, is called, or is served
    socket.on('queue:updated', () => {
      fetchStatus()
    })

    // When staff calls THIS customer specifically
    socket.on('entry:called', (data: { message: string; entryId: string }) => {
      if (data.entryId === entryId) {
        setCalled(true)
        toast.success(data.message, { duration: 10000 })

        // Request browser notification permission and show one
        if (Notification.permission === 'granted') {
          new Notification('Your order is ready! ☕', {
            body: data.message,
          })
        }
      }
    })

    // When shop closes
    socket.on('shop:status', (data: { isOpen: boolean }) => {
      if (!data.isOpen) {
        toast('The shop has closed', { icon: '🔴' })
      }
    })

    // Cleanup when customer leaves this page
    // This removes the event listeners to prevent memory leaks
    return () => {
      socket.off('queue:updated')
      socket.off('entry:called')
      socket.off('shop:status')
      socket.disconnect()
    }
  }, [slug, entryId])

  // Ask for browser notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  async function handleLeaveQueue() {
    try {
      await api.patch(`/api/queue/${slug}/entry/${entryId}`, {
        status: 'cancelled'
      })
      toast.success('You left the queue')
      navigate(`/shop/${slug}`)
    } catch (err) {
      toast.error('Failed to leave queue')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-amber-600 text-lg">Loading your status...</div>
      </div>
    )
  }

  if (!statusData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-red-500 text-lg">Could not find your queue entry</div>
      </div>
    )
  }

  const { entry, position, peopleAhead, estimatedWaitMinutes } = statusData

  // Called state — it's their turn!
  if (called || entry.status === 'called') {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            It's your turn!
          </h1>
          <p className="text-gray-600 mb-6">
            Please proceed to the counter, {entry.customer_name}!
          </p>
          <div className="bg-green-100 rounded-lg p-4">
            <p className="text-green-700 font-medium">
              ☕ Your order is being prepared
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Served state — order complete
  if (entry.status === 'served') {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-amber-800 mb-2">
            Order Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Thanks for visiting, {entry.customer_name}! Enjoy your order.
          </p>
          <button
            onClick={() => navigate(`/shop/${slug}`)}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // Waiting state — normal queue view
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">☕</div>
          <h1 className="text-xl font-bold text-amber-900">
            You're in the queue!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Hi {entry.customer_name} 👋
          </p>
        </div>

        {/* Position Display */}
        <div className="bg-amber-50 rounded-2xl p-6 mb-6 text-center">
          <p className="text-gray-500 text-sm mb-1">Your position</p>
          <div className="text-7xl font-bold text-amber-500 mb-1">
            #{position}
          </div>
          <p className="text-gray-500 text-sm">in line</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{peopleAhead}</p>
            <p className="text-gray-500 text-xs mt-1">people ahead</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              ~{estimatedWaitMinutes}
            </p>
            <p className="text-gray-500 text-xs mt-1">min wait</p>
          </div>
        </div>

        {/* Party Size */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-gray-500 text-sm">
            Party of <span className="font-bold text-gray-800">{entry.party_size}</span>
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 text-sm">Live updates enabled</span>
        </div>

        {/* Leave Queue Button */}
        <button
          onClick={handleLeaveQueue}
          className="w-full border border-red-300 text-red-500 py-3 rounded-xl
                     font-medium hover:bg-red-50 transition"
        >
          Leave Queue
        </button>
      </div>
    </div>
  )
}