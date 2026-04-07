import pool from '../config/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User, JwtPayload } from '../types'

// Find a user by their email address
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0] || null
}

// Compare a plain text password against a stored hash
// bcrypt.compare handles the comparison securely
// Returns true if they match, false if not
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

// Create a JWT token for a logged-in user
// This token is sent to the client and stored there
export function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET as string

  // Sign the token with our secret key
  // expiresIn means the token stops working after 8 hours
  // The user will need to log in again after that
  return jwt.sign(payload, secret, { expiresIn: '8h' })
}

// Verify a token that came in from a request
// Returns the decoded payload if valid, null if invalid/expired
export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET as string
    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch (err) {
    // jwt.verify throws if token is expired or tampered with
    return null
  }
}

// Hash a plain text password before storing it
// The number 10 is the "salt rounds" — higher = more secure but slower
// 10 is the industry standard balance
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}