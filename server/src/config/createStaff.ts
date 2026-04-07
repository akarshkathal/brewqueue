import pool from './db'
import { hashPassword } from '../services/authService'
import dotenv from 'dotenv'

dotenv.config()

async function createStaff() {
  try {
    // Hash the password before storing
    const hash = await hashPassword('password123')

    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      [hash, 'staff@bluebottle.com']
    )

    console.log('✅ Staff password updated successfully')
    console.log('📧 Email: staff@bluebottle.com')
    console.log('🔑 Password: password123')
  } catch (err) {
    console.error('❌ Failed:', err)
  } finally {
    await pool.end()
  }
}

createStaff()