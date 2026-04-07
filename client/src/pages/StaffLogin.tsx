import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { AuthUser } from '../types'

export default function StaffLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })

      const { token, user } = response.data

      // Save token and user to context + localStorage
      login(token, user as AuthUser)

      toast.success('Welcome back!')

      // Redirect to dashboard after login
      navigate('/staff/dashboard')

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">☕</div>
          <h1 className="text-2xl font-bold text-amber-900">BrewQueue</h1>
          <p className="text-gray-500 text-sm mt-1">Staff Login</p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@bluebottle.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-amber-400
                       text-gray-800"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-amber-400
                       text-gray-800"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                     text-white font-semibold py-4 rounded-xl text-lg transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Test credentials hint */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-400 text-xs">
            Test credentials: staff@bluebottle.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}