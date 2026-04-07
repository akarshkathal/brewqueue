import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          Looks like this page went to get coffee and never came back.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-amber-500 text-white py-3 rounded-xl
                     font-semibold hover:bg-amber-600 transition"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}