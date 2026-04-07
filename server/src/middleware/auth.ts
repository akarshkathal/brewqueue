import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/authService'
import { JwtPayload } from '../types'

// Extend Express's Request type to include our user data
// This lets us do req.user anywhere after this middleware runs
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // The token comes in the Authorization header like this:
  // "Bearer eyJhbGciOiJIUzI1NiJ9..."
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 401 means "unauthorized" — no valid credentials provided
    return res.status(401).json({ message: 'No token provided' })
  }

  // Split "Bearer TOKEN" and take the second part
  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }

  // Attach the decoded user info to the request
  // Now any route handler after this can access req.user
  req.user = decoded

  // next() passes control to the next middleware or route handler
  // Without calling next(), the request just hangs forever
  next()
}