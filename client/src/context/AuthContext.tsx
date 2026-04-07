import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('brewqueue_token')
    const savedUser = localStorage.getItem('brewqueue_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('brewqueue_token', newToken)
    localStorage.setItem('brewqueue_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('brewqueue_token')
    localStorage.removeItem('brewqueue_user')
    window.location.href = '/staff/login'
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}