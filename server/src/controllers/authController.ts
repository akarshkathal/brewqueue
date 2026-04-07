import { Request, Response } from 'express'
import * as authService from '../services/authService'

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    // Validate input exists
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find the user
    const user = await authService.getUserByEmail(email)
    if (!user) {
      // Important: don't say "user not found" — that tells attackers
      // which emails exist in your system. Always say generic message.
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isValid = await authService.verifyPassword(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = authService.generateToken({
      userId: user.id,
      shopId: user.shop_id,
      role: user.role as 'staff' | 'admin'
    })

    // Send token back to client
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        shopId: user.shop_id
      }
    })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/auth/me
// Returns current logged in user info
// Useful for the frontend to verify token is still valid
export async function getMe(req: Request, res: Response) {
  // req.user was set by the requireAuth middleware
  res.json({ user: req.user })
}