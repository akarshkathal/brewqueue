import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// A Pool is a collection of database connections
// Instead of opening and closing a connection for every query,
// the pool keeps connections open and reuses them
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message)
    console.error('❌ Full error:', err)  // Add this line
    return
  }
  console.log('✅ Database connected successfully')
  release()
})

export default pool