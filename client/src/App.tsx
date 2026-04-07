import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import CustomerJoin from './pages/CustomerJoin'
import CustomerStatus from './pages/CustomerStatus'
import StaffLogin from './pages/StaffLogin'
import StaffDashboard from './pages/StaffDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/staff/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/shop/:slug" element={<CustomerJoin />} />
      <Route path="/shop/:slug/status/:entryId" element={<CustomerStatus />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/shop/blue-bottle" />} />
    </Routes>
  )
}